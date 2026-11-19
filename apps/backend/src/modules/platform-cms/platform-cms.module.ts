// apps/backend/src/modules/platform-cms/platform-cms.module.ts
import { Module } from '@nestjs/common';
import { PlatformCmsController } from './platform-cms.controller';
import { PlatformCmsService } from './platform-cms.service';
import { PlatformCmsRepository } from './repositories/platform-cms.repository';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [PlatformCmsController],
  providers: [PlatformCmsRepository, PlatformCmsService],
  exports: [PlatformCmsRepository, PlatformCmsService],
})
export class PlatformCmsModule {}

