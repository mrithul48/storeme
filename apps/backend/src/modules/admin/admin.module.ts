// apps/backend/src/modules/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './repositories/admin.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminRepository, AdminService],
  exports: [AdminRepository, AdminService],
})
export class AdminModule {}

