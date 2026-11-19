// apps/frontend/src/services/admin.service.ts
import { apiClient } from "@/lib/api/api-client";
import { auth } from "@/lib/auth";

export interface AdminUserContext {
  id: string;
  email: string;
  role: "PLATFORM_ADMIN";
}

async function getAdminContext(): Promise<AdminUserContext> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    role: "PLATFORM_ADMIN",
  };
}

export async function getAdminOverview() {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>("/api/v1/admin/overview", {
    internalUser: admin,
  });
  return res.data;
}

export async function getAdminMerchants(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>("/api/v1/admin/merchants", {
    internalUser: admin,
    params,
  });
  return res;
}

export async function getAdminMerchantDetails(id: string) {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>(`/api/v1/admin/merchants/${id}`, {
    internalUser: admin,
  });
  return res.data;
}

export async function updateMerchantStatus(id: string, status: "ACTIVE" | "SUSPENDED", reason?: string) {
  const admin = await getAdminContext();
  const res = await apiClient.patch<any>(`/api/v1/admin/merchants/${id}/status`, {
    status,
    reason,
  }, {
    internalUser: admin,
  });
  return res;
}

export async function getAdminTransactions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>("/api/v1/admin/transactions", {
    internalUser: admin,
    params,
  });
  return res;
}

export async function getAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>("/api/v1/admin/audit-logs", {
    internalUser: admin,
    params,
  });
  return res;
}

export async function getAdminSettings() {
  const admin = await getAdminContext();
  const res = await apiClient.get<any>("/api/v1/admin/settings", {
    internalUser: admin,
  });
  return res.data;
}

