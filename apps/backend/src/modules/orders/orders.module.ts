// apps/api/src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';

@Module({
  controllers: [OrdersController],
  providers: [OrdersRepository, OrdersService],
  exports: [OrdersRepository, OrdersService],
})
export class OrdersModule {}

