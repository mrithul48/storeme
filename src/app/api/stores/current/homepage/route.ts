// src/app/api/stores/current/homepage/route.ts
// GET  — load homepage design config for dashboard
// PUT  — save homepage design config (merchant-owned, storeId scoped)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { z } from "zod";

// ─── Validation Schemas ────────────────────────────────────────────────────

const heroBannerSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  mobileUrl: z.string().url().optional().nullable().or(z.literal("")),
  mobilePublicId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0),
});

const offerBannerSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable().or(z.literal("")),
  linkType: z.enum(["CATEGORY", "PRODUCT"]).optional().nullable().or(z.literal("")),
  linkValue: z.string().optional().nullable(),
  borderRadius: z.enum(["NONE", "SM", "MD", "LG"]).optional().nullable(),
});

const testimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  sortOrder: z.number().int().min(0),
});

const badgeSchema = z.object({
  id: z.string(),
  icon: z.string().optional().nullable(),
  iconPublicId: z.string().optional().nullable(),
  text: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0),
});

const homepageDesignSchema = z.object({
  // Hero
  heroEnabled: z.boolean().optional(),
  heroType: z.enum(["CONTENT", "SLIDER"]).optional(),
  heroHeading: z.string().max(200).optional().nullable(),
  heroSubtitle: z.string().max(300).optional().nullable(),
  heroDescription: z.string().max(1000).optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  heroImagePublicId: z.string().optional().nullable(),
  heroCtaText: z.string().max(50).optional().nullable(),
  heroButtonLinkType: z.enum(["SHOP", "CATEGORY", "PRODUCT"]).optional().nullable(),
  heroButtonLinkValue: z.string().optional().nullable(),
  heroBanners: z.array(heroBannerSchema).max(3).optional().nullable(),

  // Brand
  brandSectionEnabled: z.boolean().optional(),
  brandShape: z.enum(["ROUND", "SQUARE", "RECTANGLE"]).optional(),

  // Category
  categorySectionEnabled: z.boolean().optional(),
  categoryShape: z.enum(["ROUND", "SQUARE", "RECTANGLE"]).optional(),
  categoryRadius: z.enum(["NONE", "SM", "MD", "LG", "FULL"]).optional(),

  // Sections
  newArrivalEnabled: z.boolean().optional(),
  bestSellerEnabled: z.boolean().optional(),
  testimonialSectionEnabled: z.boolean().optional(),
  allProductsEnabled: z.boolean().optional(),

  // Offer banners — max 2
  offerBanners: z.array(offerBannerSchema).max(2).optional().nullable(),

  // Testimonials — max 5
  testimonials: z.array(testimonialSchema).max(5).optional().nullable(),

  // Product card
  productCardRadius: z.enum(["NONE", "SM", "MD", "LG"]).optional(),
  showSalePrice: z.boolean().optional(),
  showOriginalPrice: z.boolean().optional(),

  // WhatsApp floating button
  whatsappEnabled: z.boolean().optional(),

  // Header
  headerDeliveryInfo: z.string().max(200).optional().nullable(),
  showAccountIcon: z.boolean().optional(),

  // About
  aboutEnabled: z.boolean().optional(),
  aboutHeading: z.string().max(200).optional().nullable(),
  aboutContent: z.string().max(5000).optional().nullable(),
  aboutImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  aboutImagePublicId: z.string().optional().nullable(),
  vision: z.string().max(2000).optional().nullable(),
  mission: z.string().max(2000).optional().nullable(),
  badges: z.array(badgeSchema).max(10).optional().nullable(),

  // Contact
  contactEnabled: z.boolean().optional(),
});

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const homePage = await prisma.homePage.findUnique({
      where: { storeId: store.id },
    });

    return NextResponse.json({ success: true, data: homePage });
  } catch (error) {
    console.error("[GET /api/stores/current/homepage]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// ─── PUT ───────────────────────────────────────────────────────────────────

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = homepageDesignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate heroButtonLinkValue references belong to this store
    if (data.heroButtonLinkType === "CATEGORY" && data.heroButtonLinkValue) {
      const cat = await prisma.category.findFirst({
        where: { id: data.heroButtonLinkValue, storeId: store.id },
        select: { id: true },
      });
      if (!cat) {
        return NextResponse.json(
          { success: false, error: "Invalid category selected for hero button" },
          { status: 400 }
        );
      }
    }
    if (data.heroButtonLinkType === "PRODUCT" && data.heroButtonLinkValue) {
      const prod = await prisma.product.findFirst({
        where: { id: data.heroButtonLinkValue, storeId: store.id },
        select: { id: true },
      });
      if (!prod) {
        return NextResponse.json(
          { success: false, error: "Invalid product selected for hero button" },
          { status: 400 }
        );
      }
    }

    // Validate offer banner link values
    if (data.offerBanners) {
      for (const banner of data.offerBanners) {
        if (banner.linkType === "CATEGORY" && banner.linkValue) {
          const cat = await prisma.category.findFirst({
            where: { id: banner.linkValue, storeId: store.id },
            select: { id: true },
          });
          if (!cat) {
            return NextResponse.json(
              { success: false, error: "Invalid category in offer banner" },
              { status: 400 }
            );
          }
        }
        if (banner.linkType === "PRODUCT" && banner.linkValue) {
          const prod = await prisma.product.findFirst({
            where: { id: banner.linkValue, storeId: store.id },
            select: { id: true },
          });
          if (!prod) {
            return NextResponse.json(
              { success: false, error: "Invalid product in offer banner" },
              { status: 400 }
            );
          }
        }
      }
    }

    // Build update payload — only include fields that were sent
    const updateData: Record<string, unknown> = {};

    const fields = [
      "heroEnabled", "heroType", "heroHeading", "heroSubtitle", "heroDescription",
      "heroImageUrl", "heroImagePublicId", "heroCtaText",
      "heroButtonLinkType", "heroButtonLinkValue", "heroBanners",
      "brandSectionEnabled", "brandShape",
      "categorySectionEnabled", "categoryShape", "categoryRadius",
      "newArrivalEnabled", "offerBanners",
      "bestSellerEnabled", "testimonialSectionEnabled", "testimonials",
      "allProductsEnabled",
      "productCardRadius", "showSalePrice", "showOriginalPrice",
      "whatsappEnabled", "headerDeliveryInfo", "showAccountIcon",
      "aboutEnabled", "aboutHeading", "aboutContent",
      "aboutImageUrl", "aboutImagePublicId",
      "vision", "mission", "badges",
      "contactEnabled",
    ] as const;

    for (const field of fields) {
      if (field in data) {
        updateData[field] = (data as Record<string, unknown>)[field];
      }
    }

    const updated = await prisma.homePage.upsert({
      where: { storeId: store.id },
      create: { storeId: store.id, ...updateData },
      update: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/stores/current/homepage]", error);
    return NextResponse.json({ success: false, error: "Failed to save homepage design" }, { status: 500 });
  }
}
