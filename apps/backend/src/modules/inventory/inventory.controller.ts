// apps/api/src/modules/inventory/inventory.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('inventory')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Public()
  @Get()
  findAll(
    @CurrentStore('id') storeId: string,
    @Query() query: QueryInventoryDto,
  ) {
    return this.inventoryService.findAll(storeId, query);
  }

  @Public()
  @Get(':productId')
  findByProduct(
    @CurrentStore('id') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.inventoryService.findByProduct(storeId, productId);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  adjustStock(
    @CurrentStore('id') storeId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(storeId, dto);
  }
}

