// apps/api/src/modules/orders/dto/update-order-status.dto.ts
import { OrderStatus } from '@launchcommerce/shared-types';

export class UpdateOrderStatusDto {
  status?: OrderStatus;
  paymentStatus?: string;
  notes?: string;
}

