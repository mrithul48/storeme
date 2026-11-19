// apps/backend/src/modules/platform-cms/interfaces/platform-cms-entities.interface.ts

export interface PlatformCmsEntity {
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
  featuresSection: Array<Record<string, unknown>> | null;
  announcementBar: string | null;
  announcementEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

