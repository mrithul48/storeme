// apps/api/src/modules/orders/dto/create-order.dto.ts
import { OrderChannel } from '@launchcommerce/shared-types';

export class OrderItemInputDto {
  productId!: string;
  variantId?: string;
  variantColor?: string;
  quantity!: number;
}

export class CustomerInputDto {
  name!: string;
  email!: string;
  phone?: string | null;
  address!: string;
  city!: string;
  state!: string;
  pincode!: string;
}

export class CreateOrderDto {
  items!: OrderItemInputDto[];
  customer!: CustomerInputDto;
  paymentMethod?: 'COD' | 'RAZORPAY' | 'WHATSAPP';
  orderChannel?: OrderChannel;
  notes?: string | null;
}
