// apps/api/src/modules/brands/brands.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('brands')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll(
    @CurrentStore('id') storeId: string,
    @Query() query: QueryBrandDto,
  ) {
    return this.brandsService.findAll(storeId, query);
  }

  @Public()
  @Get(':id')
  findOne(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.brandsService.findOne(storeId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentStore('id') storeId: string,
    @Body() dto: CreateBrandDto,
  ) {
    return this.brandsService.create(storeId, dto);
  }

  @Put(':id')
  @Patch(':id')
  update(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    const isForce = force === 'true' || force === '1';
    return this.brandsService.remove(storeId, id, isForce);
  }
}

