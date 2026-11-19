// apps/api/src/modules/orders/dto/query-order.dto.ts
import { OrderStatus, PaymentStatus, OrderChannel } from '@launchcommerce/shared-types';

export class QueryOrderDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderChannel?: OrderChannel;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

