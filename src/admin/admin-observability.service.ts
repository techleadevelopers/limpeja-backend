import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { BookingStatus } from '@prisma/client';
import { ObservabilityService } from '../observability/observability.service';
import { ConfigService } from '@nestjs/config';
import axios, { isAxiosError, type AxiosError } from 'axios';
import type { RedisClientType } from '@redis/client';

interface InsuranceBucket {
  label: string;
  cents: number;
}

interface InsuranceBreakdownPoint {
  label: string;
  count: number;
  percentageOfCompleted: number;
}

interface InsuranceConversionStats {
  completedBookings: number;
  insuredBookings: number;
  insuredRate: number;
  breakdown: InsuranceBreakdownPoint[];
}

interface SentryIssueSummary {
  id: string;
  title: string;
  platform: string;
  lastSeen: string;
}

interface SentryObservabilityPayload {
  totalUnresolved: number;
  crashFreeSessions: number | null;
  byPlatform: {
    android: number;
    ios: number;
    other: number;
  };
  recentIssues: SentryIssueSummary[];
  projectHealth?: Record<string, any>;
}

interface SentryObservabilityError {
  error: {
    message: string;
    statusCode?: number;
  };
}

type SentryObservabilityResult =
  | SentryObservabilityPayload
  | SentryObservabilityError;

interface MemoryUsageSnapshot {
  rssMb: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  arrayBuffersMb: number;
}

export interface AdminHealthSnapshot {
  status: 'ok';
  timestamp: string;
  db: {
    status: 'up';
    latencyMs: number;
  };
  memory: MemoryUsageSnapshot;
  activeSessions: number;
  insuranceConversion: InsuranceConversionStats;
  latencySeries: Array<{ timestamp: string; latencyMs: number }>;
  sentry: SentryObservabilityResult;
}

@Injectable()
export class AdminObservabilityService {
  private readonly logger = new Logger(AdminObservabilityService.name);
  private readonly insuranceBuckets: InsuranceBucket[] = [
    { label: 'R$ 59', cents: 5900 },
    { label: 'R$ 99', cents: 9900 },
    { label: 'R$ 199', cents: 19900 },
  ];
  private readonly sentryCacheKey = 'observability:sentry';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly observabilityService: ObservabilityService,
    private readonly configService: ConfigService,
  ) {}

  async getSnapshot(): Promise<AdminHealthSnapshot> {
    const start = Date.now();
    let dbLatencyMs = 0;

    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch (error: any) {
      this.logger.error(
        '[AdminHealth] DB health check falhou',
        error?.message ?? error,
      );
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Falha ao conectar com o banco de dados.',
        reason: error?.message ?? 'unknown',
      });
    }

    const memory = this.mapMemoryUsage(process.memoryUsage());
    const activeSessions = await this.estimateActiveSessions();
    const latencySeries = this.observabilityService.getLatencySeries(
      '/search',
      {
        windowHours: 6,
        points: 12,
      },
    );
    const insuranceConversion = await this.computeInsuranceConversion();
    const sentrySnapshot = await this.fetchSentrySnapshot();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: {
        status: 'up',
        latencyMs: Number(dbLatencyMs.toFixed(2)),
      },
      memory,
      activeSessions,
      insuranceConversion,
      latencySeries,
      sentry: sentrySnapshot,
    };
  }

  private mapMemoryUsage(memory: NodeJS.MemoryUsage): MemoryUsageSnapshot {
    const toMb = (value: number) => Number((value / 1024 / 1024).toFixed(2));
    return {
      rssMb: toMb(memory.rss),
      heapUsedMb: toMb(memory.heapUsed),
      heapTotalMb: toMb(memory.heapTotal),
      externalMb: toMb(memory.external),
      arrayBuffersMb: toMb(memory.arrayBuffers),
    };
  }

  private async computeInsuranceConversion(): Promise<InsuranceConversionStats> {
    const completedBookings = await this.prisma.booking.count({
      where: { status: BookingStatus.FINISHED },
    });

    const grouped = await this.prisma.bookingInsurance.groupBy({
      by: ['priceCents'],
      where: {
        booking: {
          status: BookingStatus.FINISHED,
        },
      },
      _count: {
        bookingId: true,
      },
    });

    const insuredBookings = grouped.reduce(
      (sum, item) => sum + item._count.bookingId,
      0,
    );

    const breakdown: InsuranceBreakdownPoint[] = this.insuranceBuckets.map(
      (bucket) => {
        const bucketItem = grouped.find(
          (entry) => entry.priceCents === bucket.cents,
        );
        const count = bucketItem ? bucketItem._count.bookingId : 0;
        const percentageOfCompleted = completedBookings
          ? Number(((count / completedBookings) * 100).toFixed(2))
          : 0;
        return {
          label: bucket.label,
          count,
          percentageOfCompleted,
        };
      },
    );

    return {
      completedBookings,
      insuredBookings,
      insuredRate: completedBookings
        ? Number(((insuredBookings / completedBookings) * 100).toFixed(2))
        : 0,
      breakdown,
    };
  }

  private async estimateActiveSessions(): Promise<number> {
    const redis = this.cacheService.getRedisClient();
    if (!redis) {
      return 0;
    }

    try {
      const keyCount = await this.countMatchingKeys(redis);
      if (keyCount > 0) {
        return keyCount;
      }
    } catch (error) {
      this.logger.warn(
        `[AdminHealth] falha ao contar chaves Redis para sessões: ${
          (error as Error).message ?? error
        }`,
      );
    }

    try {
      const info = await redis.info('clients');
      const match = info.match(/connected_clients:(\d+)/);
      if (match) {
        return Number(match[1]);
      }
    } catch (error) {
      this.logger.warn(
        `[AdminHealth] falha ao obter info do Redis: ${
          (error as Error).message ?? error
        }`,
      );
    }

    return 0;
  }

  private async countMatchingKeys(client: RedisClientType): Promise<number> {
    const patterns = ['session:*', 'sess:*', 'ws:*', 'socket:*'];
    let total = 0;
    for (const pattern of patterns) {
      const iterator = client.scanIterator({ MATCH: pattern, COUNT: 100 });
      for await (const _key of iterator) {
        total += 1;
      }
      if (total > 0) {
        break;
      }
    }
    return total;
  }

  private async fetchSentrySnapshot(): Promise<SentryObservabilityResult> {
    const sentryConfig = this.configService.get<{
      apiToken?: string;
      orgSlug?: string;
      projectSlug?: string;
      apiBaseUrl?: string;
    }>('sentry');
    const token = sentryConfig?.apiToken?.trim();
    const orgSlug = sentryConfig?.orgSlug?.trim();
    const projectSlug = sentryConfig?.projectSlug?.trim();
    const baseUrl =
      sentryConfig?.apiBaseUrl?.trim() || 'https://sentry.io/api/0';

    const missing: string[] = [];
    if (!token) missing.push('SENTRY_API_TOKEN');
    if (!orgSlug) missing.push('SENTRY_API_ORG_SLUG');
    if (!projectSlug) missing.push('SENTRY_API_PROJECT_SLUG');

    if (missing.length > 0) {
      const message = `Credenciais do Sentry ausentes: ${missing.join(', ')}`;
      this.logger.warn(`[AdminHealth] ${message}`);
      return this.buildSentryError(message);
    }

    const cached = await this.cacheService.get<SentryObservabilityResult>(
      this.sentryCacheKey,
    );
    if (cached) {
      return cached;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    try {
      const issuesUrl = `${baseUrl}/projects/${orgSlug}/${projectSlug}/issues/`;
      const projectUrl = `${baseUrl}/projects/${orgSlug}/${projectSlug}/`;
      const [issuesResponse, projectResponse] = await Promise.all([
        axios.get(issuesUrl, {
          headers,
          params: {
            query: 'is:unresolved',
            statsPeriod: '24h',
            per_page: 5,
          },
          timeout: 5000,
        }),
        axios.get(projectUrl, {
          headers,
          timeout: 5000,
        }),
      ]);

      console.debug(
        `[AdminHealth] Sentry issues URL: ${issuesResponse.config?.url}`,
      );
      console.debug(
        `[AdminHealth] Sentry project URL: ${projectResponse.config?.url}`,
      );

      const issues = Array.isArray(issuesResponse.data)
        ? issuesResponse.data
        : [];

      const healthStats =
        projectResponse.data?.latestRelease ?? projectResponse.data;

      const crashFreeSessions =
        typeof healthStats?.stats?.crash_free_sessions === 'number'
          ? Number(healthStats.stats.crash_free_sessions)
          : typeof healthStats?.crash_free_sessions === 'number'
            ? Number(healthStats.crash_free_sessions)
            : null;

      const byPlatform = {
        android: 0,
        ios: 0,
        other: 0,
      };

      for (const issue of issues) {
        const platform = (issue?.platform ?? 'other').toLowerCase();
        if (platform.includes('android')) {
          byPlatform.android += 1;
        } else if (platform.includes('ios') || platform.includes('iphone')) {
          byPlatform.ios += 1;
        } else {
          byPlatform.other += 1;
        }
      }

      const recentIssues = issues
        .sort((a, b) => {
          const aDate = new Date(a?.lastSeen ?? a?.dateCreated ?? 0).getTime();
          const bDate = new Date(b?.lastSeen ?? b?.dateCreated ?? 0).getTime();
          return bDate - aDate;
        })
        .slice(0, 5)
        .map((issue) => ({
          id: issue?.id ?? String(Date.now()),
          title: issue?.title ?? issue?.metadata?.value ?? 'Sem título',
          platform: issue?.platform ?? 'unknown',
          lastSeen:
            issue?.lastSeen ?? issue?.dateCreated ?? new Date().toISOString(),
        }));

      const payload: SentryObservabilityPayload = {
        totalUnresolved: issues.length,
        crashFreeSessions,
        byPlatform,
        recentIssues,
        projectHealth: projectResponse.data,
      };

      await this.cacheService.set(this.sentryCacheKey, payload, 60);
      return payload;
    } catch (error) {
      let statusCode: number | undefined;
      let message = 'Erro desconhecido ao consultar o Sentry';
      if (isAxiosError(error)) {
        console.error(
          '[AdminHealth] Sentry request URL (debug):',
          error.config?.url,
        );
        statusCode = error.response?.status;
        message =
          error.response?.data?.detail ??
          error.response?.data?.message ??
          error.message;
        if (error.response?.data) {
          console.error(
            '[AdminHealth] Sentry response body:',
            error.response.data,
          );
        }
      }
      this.logger.warn(
        `[AdminHealth] erro ao consumir API do Sentry: ${message}`,
      );
      console.error(
        `[AdminHealth] Sentry request failed (status=${statusCode ?? 'n/a'}): ${message}`,
      );
      return this.buildSentryError(message, statusCode);
    }
  }

  private buildSentryError(
    message: string,
    statusCode?: number,
  ): SentryObservabilityError {
    return {
      error: {
        message,
        statusCode,
      },
    };
  }
}
