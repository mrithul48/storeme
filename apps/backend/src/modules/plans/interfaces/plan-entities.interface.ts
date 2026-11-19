// apps/backend/src/modules/plans/interfaces/plan-entities.interface.ts

export interface PlanEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  yearlyPrice: number | null;
  durationDays: number;
  features: string[] | null;
  maxProducts: number | null;
  maxOrders: number | null;
  maxImages: number | null;
  maxMonthlyOrders: number | null;
  customDomainAccess: boolean;
  advancedAnalytics: boolean;
  premiumThemes: boolean;
  sortOrder: number;
  isFeatured: boolean;
  isPublic: boolean;
  badge: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  limits: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanWithActiveSubscriptionsCount extends PlanEntity {
  activeSubscriptionsCount: number;
  _count?: { subscriptions: number };
}

