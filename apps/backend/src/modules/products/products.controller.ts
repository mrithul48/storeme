// apps/api/src/modules/products/products.controller.ts
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('products')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(
    @CurrentStore('id') storeId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll(storeId, query);
  }

  @Public()
  @Get(':id')
  findOne(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(storeId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentStore('id') storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(storeId, dto);
  }

  @Put(':id')
  @Patch(':id')
  update(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(storeId, id);
  }
}

