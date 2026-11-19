// apps/frontend/src/services/plan.service.ts
import { apiClient } from "@/lib/api/api-client";
import { auth } from "@/lib/auth";

export interface PlanItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  yearlyPrice: number | null;
  features: string[];
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
  status: "ACTIVE" | "COMING_SOON" | "DEPRECATED";
  activeSubscriptionsCount?: number;
}

/**
 * Public: Get active plans for landing page & checkout
 */
export async function getPublicPlans(): Promise<PlanItem[]> {
  const res = await apiClient.get<any>("/api/v1/plans");
  return res.data || [];
}

/**
 * Public: Get single plan by ID
 */
export async function getPlanById(id: string): Promise<PlanItem> {
  const res = await apiClient.get<any>(`/api/v1/plans/${id}`);
  return res.data;
}

/**
 * Super Admin: Get all plans with subscription counts
 */
export async function getAllPlansForAdmin(): Promise<PlanItem[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }
  const res = await apiClient.get<any>("/api/v1/admin/plans", {
    internalUser: {
      id: session.user.id,
      email: session.user.email,
      role: "PLATFORM_ADMIN",
    },
  });
  return res.data || [];
}

/**
 * Super Admin: Create new plan
 */
export async function createPlan(data: Partial<PlanItem>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }
  return apiClient.post<any>("/api/v1/admin/plans", data, {
    internalUser: {
      id: session.user.id,
      email: session.user.email,
      role: "PLATFORM_ADMIN",
    },
  });
}

/**
 * Super Admin: Update plan
 */
export async function updatePlan(id: string, data: Partial<PlanItem>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }
  return apiClient.put<any>(`/api/v1/admin/plans/${id}`, data, {
    internalUser: {
      id: session.user.id,
      email: session.user.email,
      role: "PLATFORM_ADMIN",
    },
  });
}

/**
 * Super Admin: Deactivate / deprecate plan
 */
export async function deletePlan(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }
  return apiClient.delete<any>(`/api/v1/admin/plans/${id}`, {
    internalUser: {
      id: session.user.id,
      email: session.user.email,
      role: "PLATFORM_ADMIN",
    },
  });
}

