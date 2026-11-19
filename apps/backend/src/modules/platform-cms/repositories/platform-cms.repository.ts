// apps/backend/src/modules/platform-cms/repositories/platform-cms.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { PlatformCmsEntity } from '../interfaces/platform-cms-entities.interface';

@Injectable()
export class PlatformCmsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findDefaultCms(): Promise<PlatformCmsEntity | null> {
    return this.db.queryOne<PlatformCmsEntity>(
      `SELECT * FROM "PlatformCMS" WHERE id = 'default' LIMIT 1`,
    );
  }

  async createDefaultCms(): Promise<PlatformCmsEntity> {
    const defaultFaqs = [
      {
        question: 'Can I upgrade or downgrade my plan at any time?',
        answer:
          'Yes, you can upgrade or change your plan at any time from your Merchant Dashboard. Upgrades take effect immediately with pro-rated billing.',
      },
      {
        question: 'Are there any hidden platform transaction fees?',
        answer:
          'No. LaunchCommerce charges 0% transaction fees. You only pay standard gateway fees directly to your payment processor (e.g. Razorpay).',
      },
      {
        question: 'How does custom domain linking work?',
        answer:
          'With Scale Pro, you can connect your own custom domain (e.g., yourstore.com or yourstore.in) by adding standard CNAME and TXT records in your DNS provider.',
      },
      {
        question: 'What payment methods are supported for customers?',
        answer:
          'Stores can accept Cash on Delivery (COD), UPI, credit/debit cards, and netbanking via Razorpay, as well as Direct WhatsApp checkout.',
      },
    ];

    return (await this.db.queryOne<PlatformCmsEntity>(
      `INSERT INTO "PlatformCMS" (
        id, "platformName", "supportEmail", "heroBadge", "heroHeading", "heroDescription",
        "pricingEnabled", "pricingHeading", "pricingDescription", "pricingBadge",
        "yearlySavingsPercent", "pricingFaqs", "updatedAt"
      ) VALUES (
        'default', 'LaunchCommerce', 'support@launchcommerce.com',
        'The Modern Multi-Tenant E-Commerce Builder',
        'Build, Brand & Scale Your Online Storefront in Minutes.',
        'The lightweight, production-grade e-commerce SaaS for independent brands. Get dedicated tenant routing, Razorpay online checkout, WhatsApp direct ordering, inventory management, and custom themes.',
        true, 'Transparent Plans for Every Store',
        'No surprise platform fees. Keep all your profits.',
        'Simple Pricing', 20, $1, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET "platformName" = EXCLUDED."platformName"
      RETURNING *`,
      [JSON.stringify(defaultFaqs)],
    ))!;
  }

  async upsertCms(data: Partial<PlatformCmsEntity>): Promise<PlatformCmsEntity> {
    const existing = await this.findDefaultCms();
    if (!existing) {
      await this.createDefaultCms();
    }

    const columnMap: Record<string, string> = {
      platformName: '"platformName"',
      supportEmail: '"supportEmail"',
      heroBadge: '"heroBadge"',
      heroHeading: '"heroHeading"',
      heroDescription: '"heroDescription"',
      heroCtaText: '"heroCtaText"',
      heroCtaLink: '"heroCtaLink"',
      pricingEnabled: '"pricingEnabled"',
      pricingHeading: '"pricingHeading"',
      pricingDescription: '"pricingDescription"',
      pricingBadge: '"pricingBadge"',
      yearlySavingsPercent: '"yearlySavingsPercent"',
      pricingFaqs: '"pricingFaqs"',
      featuresSection: '"featuresSection"',
      announcementBar: '"announcementBar"',
      announcementEnabled: '"announcementEnabled"',
    };

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [prop, col] of Object.entries(columnMap)) {
      if ((data as Record<string, unknown>)[prop] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        const val = (data as Record<string, unknown>)[prop];
        values.push(
          prop === 'pricingFaqs' || prop === 'featuresSection'
            ? val !== null
              ? JSON.stringify(val)
              : null
            : val,
        );
      }
    }

    if (fields.length === 0) {
      return (await this.findDefaultCms())!;
    }

    fields.push(`"updatedAt" = NOW()`);

    return (await this.db.queryOne<PlatformCmsEntity>(
      `UPDATE "PlatformCMS" SET ${fields.join(', ')} WHERE id = 'default' RETURNING *`,
      values,
    ))!;
  }
}

