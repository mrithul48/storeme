// apps/backend/src/modules/subscriptions/subscriptions.module.ts
import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsRepository, SubscriptionsService],
  exports: [SubscriptionsRepository, SubscriptionsService],
})
export class SubscriptionsModule {}

