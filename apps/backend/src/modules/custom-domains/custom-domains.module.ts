// apps/backend/src/modules/custom-domains/custom-domains.module.ts
import { Module } from '@nestjs/common';
import { CustomDomainsController } from './custom-domains.controller';
import { CustomDomainsService } from './custom-domains.service';
import { CustomDomainsRepository } from './repositories/custom-domains.repository';

@Module({
  controllers: [CustomDomainsController],
  providers: [CustomDomainsRepository, CustomDomainsService],
  exports: [CustomDomainsRepository, CustomDomainsService],
})
export class CustomDomainsModule {}

