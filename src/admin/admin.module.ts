import { Module, forwardRef } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { AdminQueuesController } from './admin-queues.controller';
import { SettingsModule } from '../settings/settings.module';
import { AdminSettingsController } from './admin-settings.controller';
import { PaymentsModule } from '../payments/payments.module';
import { BookingsModule } from '../bookings/bookings.module';
import { AdminPaymentsController } from './admin-payments.controller';
import { AdminHealthController } from './admin-health.controller';
import { AdminObservabilityService } from './admin-observability.service';
import { AdminProvidersController } from './admin-providers.controller';
import { CacheModule } from '../cache/cache.module';
import { ObservabilityModule } from '../observability/observability.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => QueuesModule),
    SettingsModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => BookingsModule),
    CacheModule,
    ObservabilityModule,
    ProvidersModule,
  ],
  controllers: [
    AdminDashboardController,
    AdminQueuesController,
    AdminSettingsController,
    AdminPaymentsController,
    AdminHealthController,
    AdminProvidersController,
  ],
  providers: [AdminDashboardService, AdminObservabilityService],
})
export class AdminModule {}
