import React from "react";
import { prisma } from "@/lib/db";
import { AdminCmsClient } from "./admin-cms-client";
import { PlatformCmsData } from "@/services/platform-cms.service";

export default async function AdminCmsPage() {
  let cms = await prisma.platformCMS.findUnique({
    where: { id: "default" },
  });

  if (!cms) {
    cms = await prisma.platformCMS.create({
      data: {
        id: "default",
        platformName: "LaunchCommerce",
        supportEmail: "support@launchcommerce.local",
        heroBadge: "The Modern Multi-Tenant E-Commerce Builder",
        heroHeading: "Build, Brand & Scale Your Online Storefront in Minutes.",
        heroDescription:
          "The lightweight, production-grade e-commerce SaaS for independent brands. Get dedicated tenant routing, Razorpay online checkout, WhatsApp direct ordering, inventory management, and custom themes.",
        heroCtaText: "Start Your Free Store",
        heroCtaLink: "/auth/signin",
        pricingEnabled: true,
        pricingHeading: "Transparent Plans for Every Store",
        pricingDescription: "No surprise platform fees. Keep all your profits with our scalable SaaS plans.",
        pricingBadge: "Simple Pricing",
        yearlySavingsPercent: 20,
        announcementBar: "🚀 Welcome to LaunchCommerce 2.0! Scale your online brand effortlessly.",
        announcementEnabled: false,
      },
    });
  }

  const formatted: PlatformCmsData = {
    id: cms.id,
    platformName: cms.platformName,
    supportEmail: cms.supportEmail,
    heroBadge: cms.heroBadge,
    heroHeading: cms.heroHeading,
    heroDescription: cms.heroDescription,
    heroCtaText: cms.heroCtaText,
    heroCtaLink: cms.heroCtaLink,
    pricingEnabled: cms.pricingEnabled,
    pricingHeading: cms.pricingHeading,
    pricingDescription: cms.pricingDescription,
    pricingBadge: cms.pricingBadge,
    yearlySavingsPercent: cms.yearlySavingsPercent,
    pricingFaqs: Array.isArray(cms.pricingFaqs) ? (cms.pricingFaqs as any) : [],
    featuresSection: cms.featuresSection,
    announcementBar: cms.announcementBar,
    announcementEnabled: cms.announcementEnabled,
    updatedAt: cms.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Platform Landing Page CMS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize the public landing page hero copy, global announcement banner, pricing headings, annual discounts, and FAQs.
        </p>
      </div>

      <AdminCmsClient initialCms={formatted} />
    </div>
  );
}

