// apps/backend/src/modules/subscriptions/dto/subscription.dto.ts

export class SubscriptionCheckoutDto {
  planId!: string;
  billingPeriod?: 'MONTHLY' | 'YEARLY' = 'YEARLY';
}

export class SubscriptionVerifyDto {
  planId!: string;
  razorpayOrderId!: string;
  razorpayPaymentId!: string;
  razorpaySignature!: string;
  billingPeriod?: 'MONTHLY' | 'YEARLY' = 'YEARLY';
}

export class CancelSubscriptionDto {
  reason?: string;
}
