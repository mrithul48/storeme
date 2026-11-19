// apps/api/src/modules/brands/brands.module.ts
import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './repositories/brands.repository';

@Module({
  controllers: [BrandsController],
  providers: [BrandsRepository, BrandsService],
  exports: [BrandsRepository, BrandsService],
})
export class BrandsModule {}

