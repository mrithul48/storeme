// prisma/seed.ts
import { prisma } from "../src/lib/db";


async function main() {
  console.log("Seeding database...");

  // 1. Create or Find Subscription Plans
  let growthPlan = await prisma.plan.findFirst({
    where: { name: "Growth Plan" },
  });

  if (!growthPlan) {
    growthPlan = await prisma.plan.create({
      data: {
        name: "Growth Plan",
        description: "Ideal for boutique businesses starting their online store",
        price: 199.0,
        status: "ACTIVE",
        features: [
          "Up to 100 Products",
          "5 Images per product",
          "Razorpay & COD Checkout",
          "Custom Theme Styling",
          "WhatsApp Ordering",
        ],
        maxProducts: 100,
        maxImages: 5,
      },
    });
  }

  let proPlan = await prisma.plan.findFirst({
    where: { name: "Scale Pro" },
  });

  if (!proPlan) {
    proPlan = await prisma.plan.create({
      data: {
        name: "Scale Pro",
        description: "For high-volume merchants scaling national brands",
        price: 499.0,
        status: "ACTIVE",
        features: [
          "Unlimited Products",
          "10 Images per product",
          "Priority Settlements",
          "Custom Domain Linking",
          "Transactional Emails",
        ],
        maxProducts: 5000,
        maxImages: 10,
      },
    });
  }

  // 2. Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "founder@launchcommerce.io" },
    update: {},
    create: {
      email: "founder@launchcommerce.io",
      name: "Alex Mercer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    },
  });

  // 3. Demo Store: Lumina Apparel
  let store = await prisma.store.findUnique({
    where: { slug: "lumina-apparel" },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        slug: "lumina-apparel",
        name: "Lumina Apparel",
        ownerId: demoUser.id,
        status: "ACTIVE",
      },
    });

    // Company details
    await prisma.companyDetails.create({
      data: {
        storeId: store.id,
        businessType: "Fashion & Lifestyle",
        description:
          "Handcrafted contemporary apparel designed for comfort, minimalism, and timeless style.",
        email: "contact@lumina.style",
        phone: "+91 9876543210",
        whatsapp: "+91 9876543210",
        address: "74 Fashion Boulevard, Indiranagar, Bengaluru, KA 560038",
        logoUrl:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&h=150&fit=crop",
      },
    });

    // Store settings
    await prisma.storeSettings.create({
      data: {
        storeId: store.id,
        ordersEnabled: true,
        brandsEnabled: true,
      },
    });

    // Theme settings (Ocean Blue primary)
    await prisma.themeSettings.create({
      data: {
        storeId: store.id,
        primaryColor: "#3b82f6",
        secondaryColor: "#1e293b",
        accentColor: "#60a5fa",
        buttonShape: "MEDIUM_ROUNDED",
      },
    });

    // Working hours
    for (let day = 0; day < 7; day++) {
      await prisma.workingHours.create({
        data: {
          storeId: store.id,
          dayOfWeek: day,
          isOpen: day !== 0, // open Mon-Sat
          openTime: "10:00",
          closeTime: "20:00",
        },
      });
    }

    // Homepage CMS
    await prisma.homePage.create({
      data: {
        storeId: store.id,
        heroHeading: "Elegance in Every Stitch",
        heroSubtitle:
          "Explore our Autumn & Winter handcrafted urban collection with nationwide fast shipping.",
        heroEnabled: true,
      },
    });

    // Subscription
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    await prisma.subscription.create({
      data: {
        storeId: store.id,
        planId: growthPlan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: expiry,
      },
    });

    // Categories
    const catOuterwear = await prisma.category.create({
      data: {
        storeId: store.id,
        name: "Outerwear & Jackets",
        slug: "outerwear",
        sortOrder: 1,
        status: "ACTIVE",
      },
    });

    const catFootwear = await prisma.category.create({
      data: {
        storeId: store.id,
        name: "Minimalist Footwear",
        slug: "footwear",
        sortOrder: 2,
        status: "ACTIVE",
      },
    });

    const catAccessories = await prisma.category.create({
      data: {
        storeId: store.id,
        name: "Accessories & Bags",
        slug: "accessories",
        sortOrder: 3,
        status: "ACTIVE",
      },
    });

    // Products
    const p1 = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: catOuterwear.id,
        name: "Oversized Merino Wool Cardigan",
        slug: "oversized-merino-wool-cardigan",
        description:
          "Crafted from 100% fine Australian Merino wool. Features a relaxed drop-shoulder silhouette, ribbed horn buttons, and twin patch pockets.",
        price: 3499.0,
        salePrice: 2899.0,
        sku: "LUM-CRD-001",
        stock: 18,
        status: "ACTIVE",
        featured: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&fit=crop",
              publicId: "seed_cardigan_1",
              sortOrder: 0,
            },
          ],
        },
      },
    });

    const p2 = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: catFootwear.id,
        name: "Monochrome Low-Top Leather Sneakers",
        slug: "monochrome-low-top-sneakers",
        description:
          "Sleek Italian full-grain nappa leather sneakers with padded collar and durable Margom vulcanized rubber cupsole.",
        price: 4999.0,
        salePrice: 3999.0,
        sku: "LUM-SNK-002",
        stock: 12,
        status: "ACTIVE",
        featured: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&fit=crop",
              publicId: "seed_sneakers_1",
              sortOrder: 0,
            },
          ],
        },
      },
    });

    const p3 = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: catAccessories.id,
        name: "Vintage Waxed Canvas Weekender Duffle",
        slug: "waxed-canvas-weekender-duffle",
        description:
          "Water-repellent 18oz Scottish waxed canvas with vegetable-tanned leather straps and solid brass hardware. Ideal for weekend escapes.",
        price: 5499.0,
        salePrice: null,
        sku: "LUM-BAG-003",
        stock: 6,
        status: "ACTIVE",
        featured: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&fit=crop",
              publicId: "seed_duffle_1",
              sortOrder: 0,
            },
          ],
        },
      },
    });

    const p4 = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: catOuterwear.id,
        name: "Technical Utility Trench Coat",
        slug: "technical-utility-trench-coat",
        description:
          "Engineered three-layer waterproof breathable shell with magnetic pocket closures and internal carry strap.",
        price: 6999.0,
        salePrice: 5999.0,
        sku: "LUM-TRN-004",
        stock: 8,
        status: "ACTIVE",
        featured: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&fit=crop",
              publicId: "seed_trench_1",
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // Sample Customer and Order
    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: "Rohan Verma",
        email: "rohan.verma@example.com",
        phone: "+91 9123456780",
      },
    });

    await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        orderNumber: "ORD-94821",
        subtotal: 2899.0,
        total: 2899.0,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod: "RAZORPAY",
        shippingAddress: {
          address: "Flat 402, Skyline Towers",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
        },
        items: {
          create: [
            {
              productId: p1.id,
              productName: p1.name,
              productSku: p1.sku,
              price: 2899.0,
              quantity: 1,
              subtotal: 2899.0,
            },
          ],
        },
      },
    });

    console.log("Created demo store: Lumina Apparel with products and orders!");
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
