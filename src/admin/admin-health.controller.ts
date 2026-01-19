import { Controller, Get } from '@nestjs/common';
import {
  AdminObservabilityService,
  AdminHealthSnapshot,
} from './admin-observability.service';

@Controller('admin/health')
export class AdminHealthController {
  constructor(
    private readonly observabilityService: AdminObservabilityService,
  ) {}

  @Get()
  async getHealth(): Promise<AdminHealthSnapshot & { apiLatencyMs: number }> {
    const start = Date.now();
    const snapshot = await this.observabilityService.getSnapshot();
    const latency = Date.now() - start;

    return {
      ...snapshot,
      apiLatencyMs: Number(latency.toFixed(2)),
    };
  }
}
