// apps/backend/src/modules/platform-cms/dto/update-platform-cms.dto.ts

export class UpdatePlatformCmsDto {
  platformName?: string;
  supportEmail?: string;
  heroBadge?: string;
  heroHeading?: string;
  heroDescription?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  pricingEnabled?: boolean;
  pricingHeading?: string;
  pricingDescription?: string;
  pricingBadge?: string;
  yearlySavingsPercent?: number;
  pricingFaqs?: any[];
  featuresSection?: any;
  announcementBar?: string;
  announcementEnabled?: boolean;
}
