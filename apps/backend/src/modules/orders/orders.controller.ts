// apps/api/src/modules/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('orders')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Get('storefront/:orderNumber')
  getStorefrontOrder(
    @Param('orderNumber') orderNumber: string,
    @Query('storeId') storeId?: string,
    @Query('storeSlug') storeSlug?: string,
  ) {
    return this.ordersService.findStorefrontOrder(orderNumber, storeId, storeSlug);
  }

  @Public()
  @Get('by-customer/:customerId')
  getCustomerOrders(
    @Param('customerId') customerId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.ordersService.findByCustomerId(customerId, storeId);
  }

  @Public()
  @Post('shipping/calculate')
  @HttpCode(HttpStatus.OK)
  calculateShipping(
    @Body() dto: { storeId?: string; storeSlug?: string; items: Array<{ productId: string; quantity: number }> },
  ) {
    return this.ordersService.calculateOrderShipping(dto);
  }

  @Post('receipts')
  @HttpCode(HttpStatus.OK)
  getReceipts(
    @CurrentStore('id') storeId: string,
    @Body() body: { orderIds: string[] },
  ) {
    return this.ordersService.getOrderReceipts(storeId, body.orderIds || []);
  }

  @Get('summary')
  getSummary(@CurrentStore('id') storeId: string) {
    return this.ordersService.getSummary(storeId);
  }

  @Get('recent')
  getRecent(@CurrentStore('id') storeId: string) {
    return this.ordersService.getRecent(storeId);
  }

  @Get()
  findAll(
    @CurrentStore('id') storeId: string,
    @Query() query: QueryOrderDto,
  ) {
    return this.ordersService.findAll(storeId, query);
  }

  @Get(':id')
  findOne(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(storeId, id);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentStore('id') storeId: string,
    @Body() dto: CreateOrderDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.create(storeId, dto, idempotencyKey);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(storeId, id, dto);
  }
}

