// apps/api/src/modules/categories/categories.controller.ts
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll(
    @CurrentStore('id') storeId: string,
    @Query() query: QueryCategoryDto,
  ) {
    return this.categoriesService.findAll(storeId, query);
  }

  @Public()
  @Get(':id')
  findOne(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(storeId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentStore('id') storeId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(storeId, dto);
  }

  @Put(':id')
  @Patch(':id')
  update(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    const isForce = force === 'true' || force === '1';
    return this.categoriesService.remove(storeId, id, isForce);
  }
}

