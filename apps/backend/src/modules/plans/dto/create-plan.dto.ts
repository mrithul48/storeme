// apps/backend/src/modules/plans/dto/create-plan.dto.ts

export class CreatePlanDto {
  name!: string;
  slug?: string;
  price!: number;
  yearlyPrice?: number;
  description?: string;
  features!: string[];
  maxProducts?: number;
  maxOrders?: number;
  maxImages?: number;
  maxMonthlyOrders?: number;
  customDomainAccess?: boolean;
  advancedAnalytics?: boolean;
  premiumThemes?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  isPublic?: boolean;
  badge?: string;
  status?: 'ACTIVE' | 'COMING_SOON' | 'DEPRECATED';
  limits?: any;
}

export class UpdatePlanDto {
  name?: string;
  slug?: string;
  price?: number;
  yearlyPrice?: number;
  description?: string;
  features?: string[];
  maxProducts?: number;
  maxOrders?: number;
  maxImages?: number;
  maxMonthlyOrders?: number;
  customDomainAccess?: boolean;
  advancedAnalytics?: boolean;
  premiumThemes?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  isPublic?: boolean;
  badge?: string;
  status?: 'ACTIVE' | 'COMING_SOON' | 'DEPRECATED';
  limits?: any;
}
