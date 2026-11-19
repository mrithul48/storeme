// apps/frontend/src/services/platform-cms.service.ts
import { apiClient } from "@/lib/api/api-client";
import { auth } from "@/lib/auth";

export interface PlatformCmsData {
  id: string;
  platformName: string;
  supportEmail: string | null;
  heroBadge: string | null;
  heroHeading: string | null;
  heroDescription: string | null;
  heroCtaText: string | null;
  heroCtaLink: string | null;
  pricingEnabled: boolean;
  pricingHeading: string | null;
  pricingDescription: string | null;
  pricingBadge: string | null;
  yearlySavingsPercent: number;
  pricingFaqs: Array<{ question: string; answer: string }> | null;
  featuresSection: any;
  announcementBar: string | null;
  announcementEnabled: boolean;
  updatedAt: string;
}

export async function getPlatformCms(): Promise<PlatformCmsData> {
  const res = await apiClient.get<any>("/api/v1/platform/cms");
  return res.data;
}

export async function updatePlatformCms(data: Partial<PlatformCmsData>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized — PLATFORM_ADMIN role required");
  }

  const res = await apiClient.put<any>("/api/v1/admin/platform/cms", data, {
    internalUser: {
      id: session.user.id,
      email: session.user.email,
      role: "PLATFORM_ADMIN",
    },
  });

  return res;
}

