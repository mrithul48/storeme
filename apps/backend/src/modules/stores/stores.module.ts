// apps/backend/src/modules/stores/stores.module.ts
import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { StoresRepository } from './repositories/stores.repository';

@Module({
  controllers: [StoresController],
  providers: [StoresRepository, StoresService],
  exports: [StoresRepository, StoresService],
})
export class StoresModule {}

