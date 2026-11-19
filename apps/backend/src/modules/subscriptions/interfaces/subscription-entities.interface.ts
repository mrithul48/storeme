// apps/backend/src/modules/subscriptions/interfaces/subscription-entities.interface.ts

export interface SubscriptionEntity {
  id: string;
  storeId: string;
  planId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  billingPeriod: 'MONTHLY' | 'YEARLY';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  razorpaySubscriptionId: string | null;
  razorpayPaymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentEntity {
  id: string;
  storeId?: string | null;
  orderId?: string | null;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

