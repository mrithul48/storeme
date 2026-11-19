// apps/api/src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { TenantGuard } from './guards/tenant.guard';
import { InternalServiceGuard } from './guards/internal-service.guard';
import { CompositeAuthGuard } from './guards/composite-auth.guard';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [
    TenantGuard,
    InternalServiceGuard,
    JwtAuthGuard,
    CompositeAuthGuard,
    RolesGuard,
  ],
  exports: [
    TenantGuard,
    InternalServiceGuard,
    JwtAuthGuard,
    CompositeAuthGuard,
    RolesGuard,
  ],
})
export class CommonModule {}

