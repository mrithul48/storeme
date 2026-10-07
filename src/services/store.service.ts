// src/services/store.service.ts
// Business logic for store operations — separated from route handlers

import { prisma } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";
import type { CreateStoreInput } from "@/validations/store.schema";

/**
 * Get a store by the owner's user ID, google ID, or email
 */
export async function getStoreByOwnerId(ownerId: string) {
  if (!ownerId) return null;

  // 1. Direct lookup by ownerId
  let store = await prisma.store.findUnique({
    where: { ownerId },
    include: {
      company: true,
      settings: true,
      theme: true,
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (store) return store;

  // 2. Fallback: check if ownerId is a User's googleId
  const userByGoogleId = await prisma.user.findFirst({
    where: { googleId: ownerId },
    select: { id: true },
  });

  if (userByGoogleId) {
    store = await prisma.store.findUnique({
      where: { ownerId: userByGoogleId.id },
      include: {
        company: true,
        settings: true,
        theme: true,
        subscription: {
          include: { plan: true },
        },
      },
    });
    if (store) return store;
  }

  // 3. Fallback: check if ownerId is an email address
  if (ownerId.includes("@")) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: ownerId.toLowerCase() },
      select: { id: true },
    });

    if (userByEmail) {
      return prisma.store.findUnique({
        where: { ownerId: userByEmail.id },
        include: {
          company: true,
          settings: true,
          theme: true,
          subscription: {
            include: { plan: true },
          },
        },
      });
    }
  }

  return null;
}

/**
 * Check if a user already has a store (for onboarding redirect logic)
 */
export async function userHasStore(ownerId: string): Promise<boolean> {
  const count = await prisma.store.count({ where: { ownerId } });
  return count > 0;
}

/**
 * Create a store with all required related records in a single transaction
 */
export async function createStore(ownerId: string, data: CreateStoreInput) {
  // Generate a unique slug
  const existingSlugs = await prisma.store
    .findMany({ select: { slug: true } })
    .then((stores) => stores.map((s) => s.slug));

  const slug = generateUniqueSlug(data.businessName, existingSlugs);

  // Find the basic ₹199 plan to attach subscription
  const basicPlan = await prisma.plan.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { price: "asc" },
  });

  const now = new Date();
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  return prisma.$transaction(async (tx) => {
    // 1. Create the store
    const store = await tx.store.create({
      data: {
        slug,
        name: data.businessName,
        ownerId,
        status: "ACTIVE",
      },
    });

    // 2. Create company details
    await tx.companyDetails.create({
      data: {
        storeId: store.id,
        businessType: data.businessType,
        address: data.businessAddress || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        logoPublicId: data.logoPublicId || null,
        socialLinks: data.socialLinks ? JSON.parse(JSON.stringify(data.socialLinks)) : undefined,
      },
    });

    // 3. Create store settings with defaults
    await tx.storeSettings.create({
      data: {
        storeId: store.id,
        brandsEnabled: false,
        ordersEnabled: true,
      },
    });

    // 4. Create theme settings
    const themeData = data.theme ?? {};
    await tx.themeSettings.create({
      data: {
        storeId: store.id,
        primaryColor: themeData.primaryColor ?? "#22c55e",
        secondaryColor: themeData.secondaryColor ?? "#f0fdf4",
        accentColor: themeData.accentColor ?? "#16a34a",
        backgroundColor: themeData.backgroundColor ?? "#ffffff",
        surfaceColor: themeData.surfaceColor ?? "#f6faf7",
        textColor: themeData.textColor ?? "#111827",
        mutedTextColor: themeData.mutedTextColor ?? "#6b7280",
        navbarBg: themeData.navbarBg ?? "#ffffff",
        navbarText: themeData.navbarText ?? "#111827",
        buttonShape: themeData.buttonShape ?? "MEDIUM_ROUNDED",
        primaryFont: themeData.primaryFont ?? "Inter",
      },
    });

    // 5. Create working hours if provided
    if (data.workingHours && data.workingHours.length > 0) {
      await tx.workingHours.createMany({
        data: data.workingHours.map((day) => ({
          storeId: store.id,
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          openTime: day.openTime || null,
          closeTime: day.closeTime || null,
        })),
      });
    }

    // 6. Create initial CMS homepage config
    await tx.homePage.create({
      data: {
        storeId: store.id,
        heroType: "SLIDER",
        heroEnabled: true,
        aboutEnabled: false,
      },
    });

    // 7. Create subscription if a plan exists
    if (basicPlan) {
      await tx.subscription.create({
        data: {
          storeId: store.id,
          planId: basicPlan.id,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: oneYearFromNow,
        },
      });
    }

    return store;
  });
}

/**
 * Get the full storefront config for a given slug or custom domain (public — no auth required)
 */
export async function getStorefrontConfig(slugOrDomain: string) {
  const selectFields = {
    id: true,
    slug: true,
    name: true,
    status: true,
    customDomain: true,
    domainStatus: true,
    company: {
      select: {
        businessType: true,
        address: true,
        email: true,
        phone: true,
        whatsapp: true,
        description: true,
        logoUrl: true,
        socialLinks: true,
      },
    },
    settings: {
      select: {
        brandsEnabled: true,
        ordersEnabled: true,
        codEnabled: true,
        onlinePaymentEnabled: true,
        whatsappOrderEnabled: true,
      },
    },
    theme: {
      select: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        backgroundColor: true,
        surfaceColor: true,
        textColor: true,
        mutedTextColor: true,
        navbarBg: true,
        navbarText: true,
        buttonBg: true,
        buttonText: true,
        h1Color: true,
        h2Color: true,
        paragraphColor: true,
        buttonShape: true,
        primaryFont: true,
      },
    },
    // Full homePage record — includes all design fields
    homePage: true,
    workingHours: {
      orderBy: { dayOfWeek: "asc" as const },
    },
    // Only include connection status — never include encryptedSecret
    merchantPaymentConfig: {
      where: { provider: "razorpay", isActive: true },
      select: { isActive: true },
      take: 1,
    },
    // Public customer auth config — never include encryptedGoogleClientSecret
    authConfig: {
      select: {
        googleEnabled: true,
        googleClientId: true,
      },
    },
  };

  // 1. Try finding by store slug first
  let store = await prisma.store.findUnique({
    where: { slug: slugOrDomain },
    select: selectFields,
  });

  // 2. If not found by slug, resolve by verified custom domain
  if (!store) {
    const normalized = slugOrDomain.trim().toLowerCase();
    store = await prisma.store.findFirst({
      where: {
        OR: [
          { customDomain: normalized, domainStatus: "CONNECTED" },
          { customDomainRecord: { domain: normalized, status: "VERIFIED" } },
        ],
        status: "ACTIVE",
      },
      select: selectFields,
    });
  }

  return store;
}

/**
 * Get dashboard statistics for a store — uses aggregates, not full data fetch
 */
export async function getDashboardStats(storeId: string) {
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProducts,
    activeProducts,
    totalCustomers,
    revenueResult,
  ] = await Promise.all([
    prisma.order.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, status: "PENDING" } }),
    prisma.order.count({ where: { storeId, status: "DELIVERED" } }),
    prisma.product.count({ where: { storeId } }),
    prisma.product.count({ where: { storeId, status: "ACTIVE" } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.order.aggregate({
      where: { storeId, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProducts,
    activeProducts,
    totalCustomers,
    revenue: revenueResult._sum.total ? Number(revenueResult._sum.total) : 0,
  };
}
