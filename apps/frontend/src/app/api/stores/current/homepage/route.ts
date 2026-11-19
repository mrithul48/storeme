// src/app/api/stores/current/homepage/route.ts
// GET  — load homepage design config for dashboard
// PUT  — save homepage design config (merchant-owned, storeId scoped)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getStoreByOwnerId,
  getStoreHomePage,
  updateStoreHomePage,
} from "@/services/store.service";
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
  count: z.string().max(50).optional().default(""),
  heading: z.string().max(100).optional().default(""),
  description: z.string().max(300).optional().default(""),
  text: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  iconPublicId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0),
});

const policyPointSchema = z.object({
  id: z.string(),
  heading: z.string().max(200).optional().default(""),
  description: z.string().max(10000).optional().default(""),
  sortOrder: z.number().int().min(0).optional().default(0),
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
  brandShape: z.enum(["SQUARE", "CIRCLE"]).optional(),

  // Category
  categorySectionEnabled: z.boolean().optional(),
  categoryShape: z.enum(["SQUARE", "CIRCLE"]).optional(),
  categoryRadius: z.enum(["NONE", "SM", "MD", "LG", "FULL"]).optional().nullable(),

  // New Arrival
  newArrivalEnabled: z.boolean().optional(),

  // Offer Banners
  offerBanners: z.array(offerBannerSchema).max(5).optional().nullable(),

  // Best Seller
  bestSellerEnabled: z.boolean().optional(),

  // Testimonials
  testimonialSectionEnabled: z.boolean().optional(),
  testimonials: z.array(testimonialSchema).max(10).optional().nullable(),

  // All Products
  allProductsEnabled: z.boolean().optional(),

  // Design & Display
  productCardRadius: z.enum(["NONE", "SM", "MD", "LG"]).optional(),
  showSalePrice: z.boolean().optional(),
  showOriginalPrice: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  headerDeliveryInfo: z.string().max(100).optional().nullable(),
  showAccountIcon: z.boolean().optional(),

  // About Section
  aboutEnabled: z.boolean().optional(),
  aboutHeading: z.string().max(200).optional().nullable(),
  aboutContent: z.string().max(5000).optional().nullable(),
  aboutImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  aboutImagePublicId: z.string().optional().nullable(),
  vision: z.string().max(1000).optional().nullable(),
  mission: z.string().max(1000).optional().nullable(),
  badges: z.array(badgeSchema).max(4).optional().nullable(),

  // Contact
  contactEnabled: z.boolean().optional(),

  // Policies (delivery, refund, privacy)
  deliveryPolicyHeading: z.string().max(200).optional().nullable(),
  deliveryPolicyDescription: z.string().max(50000).optional().nullable(),
  deliveryPoints: z.array(policyPointSchema).max(50).optional().nullable(),
  refundPolicyHeading: z.string().max(200).optional().nullable(),
  refundPolicyDescription: z.string().max(50000).optional().nullable(),
  refundPoints: z.array(policyPointSchema).max(50).optional().nullable(),
  privacyPolicyHeading: z.string().max(200).optional().nullable(),
  privacyPolicyDescription: z.string().max(50000).optional().nullable(),
  privacyPoints: z.array(policyPointSchema).max(50).optional().nullable(),
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

    const homePage = await getStoreHomePage(store.id);

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

    const updated = await updateStoreHomePage(store.id, parsed.data);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/stores/current/homepage]", error);
    return NextResponse.json({ success: false, error: "Failed to save homepage design" }, { status: 500 });
  }
}
