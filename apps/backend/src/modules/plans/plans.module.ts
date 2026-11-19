// apps/backend/src/modules/plans/plans.module.ts
import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './repositories/plans.repository';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [PlansController],
  providers: [PlansRepository, PlansService],
  exports: [PlansRepository, PlansService],
})
export class PlansModule {}

