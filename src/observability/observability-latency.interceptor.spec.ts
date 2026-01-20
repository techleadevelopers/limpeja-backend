import { ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, of } from 'rxjs';
import { ObservabilityLatencyInterceptor } from './observability-latency.interceptor';

const makeExecutionContext = (request: Record<string, any>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext);

const createConfigService = (overrides: Record<string, unknown> = {}) =>
  ({
    get: (key: string) => {
      const defaults: Record<string, unknown> = {
        'observability.latency.enabled': true,
        'observability.latency.sampleRateDefault': 0.1,
        'observability.latency.sampleRateCritical': 1,
      };
      return overrides.hasOwnProperty(key) ? overrides[key] : defaults[key];
    },
  } as ConfigService);

describe('ObservabilityLatencyInterceptor', () => {
  let observabilityService: { recordLatency: jest.Mock };
  let interceptor: ObservabilityLatencyInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    observabilityService = {
      recordLatency: jest.fn(),
    };
    interceptor = new ObservabilityLatencyInterceptor(
      observabilityService as any,
      createConfigService(),
    );
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records latency with normalized route key', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const request = {
      baseUrl: '/api',
      route: { path: '/providers/:id' },
      headers: {},
    };
    const context = makeExecutionContext(request);
    const next = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(context, next as any));

    expect(observabilityService.recordLatency).toHaveBeenCalled();
    const [routeKey, duration] =
      observabilityService.recordLatency.mock.calls[0];
    expect(routeKey).toBe('/api/providers/{id}');
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('always records latency for critical routes regardless of random value', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.95);
    interceptor = new ObservabilityLatencyInterceptor(
      observabilityService as any,
      createConfigService({ 'observability.latency.sampleRateDefault': 0.1 }),
    );
    const request = {
      baseUrl: '/api',
      route: { path: '/bookings/:id' },
      headers: {},
    };
    const context = makeExecutionContext(request);
    const next = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(context, next as any));
    expect(observabilityService.recordLatency).toHaveBeenCalled();
  });

  it('obeys sampling for non-critical routes', async () => {
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0.5);
    interceptor = new ObservabilityLatencyInterceptor(
      observabilityService as any,
      createConfigService({ 'observability.latency.sampleRateDefault': 0.1 }),
    );
    const request = {
      baseUrl: '/api',
      route: { path: '/noncritical/:id' },
      headers: {},
    };
    const context = makeExecutionContext(request);
    const next = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(context, next as any));
    expect(observabilityService.recordLatency).not.toHaveBeenCalled();

    randomSpy.mockReturnValueOnce(0.05);
    await lastValueFrom(interceptor.intercept(context, next as any));
    expect(observabilityService.recordLatency).toHaveBeenCalled();
  });

  it('swallows recordLatency errors and logs request id', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const request = {
      baseUrl: '/api',
      route: { path: '/providers/:id' },
      headers: { 'x-client-request-id': 'trace-123' },
    };
    const context = makeExecutionContext(request);
    const next = { handle: () => of('ok') };
    observabilityService.recordLatency.mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(
      lastValueFrom(interceptor.intercept(context, next as any)),
    ).resolves.toEqual('ok');

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('requestId=trace-123'),
      expect.anything(),
    );
  });
});
