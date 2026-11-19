// apps/backend/src/modules/customers/interfaces/customer-entities.interface.ts

export interface CustomerEntity {
  id: string;
  storeId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerOrderSummary {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
  createdAt: Date;
}

export interface CustomerDetail extends CustomerEntity {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
  orders: CustomerOrderSummary[];
}

