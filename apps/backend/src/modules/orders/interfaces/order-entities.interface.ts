// apps/backend/src/modules/orders/interfaces/order-entities.interface.ts

export interface OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  variantId: string | null;
  variantColor: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  createdAt?: Date;
}

export interface OrderEntity {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId: string;
  subtotal: number;
  shippingCharge: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  orderChannel: string;
  shippingAddress: Record<string, unknown> | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemEntity[];
  customer?: { id: string; name: string; email: string | null; phone: string | null } | null;
  payment?: { id: string; status: string; amount: number; currency: string } | null;
}

export interface OrderSummaryStats {
  totalOrders: number;
  grossSales: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: OrderEntity[];
}

