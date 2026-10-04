// src/types/order.types.ts

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  itemCount: number;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  createdAt: Date;
}

export interface OrderWithRelations extends OrderListItem {
  subtotal: number;
  paymentMethod?: string | null;
  notes?: string | null;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
}

export interface CreateOrderInput {
  storeId: string;
  customer: CheckoutFormData;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
  paymentMethod?: string;
}
