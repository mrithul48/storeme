// apps/backend/src/modules/plan-enforcement/plan-enforcement.module.ts
import { Module, Global } from '@nestjs/common';
import { PlanEnforcementService } from './plan-enforcement.service';

@Global()
@Module({
  providers: [PlanEnforcementService],
  exports: [PlanEnforcementService],
})
export class PlanEnforcementModule {}

