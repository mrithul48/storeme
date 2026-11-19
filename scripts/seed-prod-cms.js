// scripts/seed-prod-cms.js — seeds PlatformCMS default record and Plans for production
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL env var not set. Run: set DATABASE_URL=... && node scripts/seed-prod-cms.js');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding production PlatformCMS and Plans...\n');

  // 1. Seed default PlatformCMS record (upsert — safe to re-run)
  const cms = await prisma.platformCMS.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      platformName: 'LaunchCommerce',
      supportEmail: 'support@launchcommerce.com',
      heroBadge: 'The Modern Multi-Tenant E-Commerce Builder',
      heroHeading: 'Build, Brand & Scale Your Online Storefront in Minutes.',
      heroDescription: 'Everything you need to sell online — products, payments, orders, and analytics — all in one place. Start free, no credit card required.',
      heroCtaText: 'Get Started Free',
      heroCtaLink: '/auth/signin',
      pricingEnabled: true,
      pricingHeading: 'Transparent Plans for Every Store',
      pricingDescription: 'No surprise platform fees. Keep all your profits.',
      pricingBadge: 'Simple Pricing',
      yearlySavingsPercent: 20,
      pricingFaqs: [
        { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade at any time from your dashboard.' },
        { q: 'Is there a free trial?', a: 'Yes! Start with the Starter plan at no cost and upgrade when you are ready to grow.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards via Razorpay.' },
        { q: 'Are there any hidden fees?', a: 'No. The price you see is exactly what you pay. No platform transaction fees.' },
      ],
      announcementBar: '🚀 New: AI-powered product descriptions now available on Growth & Enterprise plans!',
      announcementEnabled: true,
    },
  });
  console.log('✓ PlatformCMS record:', cms.id);

  // 2. Seed Plans if none exist
  const existingPlans = await prisma.plan.count();
  if (existingPlans === 0) {
    console.log('\nNo plans found — seeding default plans...');

    const starter = await prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        name: 'Starter',
        slug: 'starter',
        description: 'Perfect for new entrepreneurs and side projects.',
        price: 0,
        yearlyPrice: 0,
        maxProducts: 20,
        customDomainAccess: false,
        advancedAnalytics: false,
        premiumThemes: false,
        features: ['Up to 20 products', 'Basic analytics', 'Standard themes', 'Email support'],
        status: 'ACTIVE',
        sortOrder: 1,
      },
    });
    console.log('  ✓ Starter plan:', starter.id);

    const growth = await prisma.plan.upsert({
      where: { slug: 'growth' },
      update: {},
      create: {
        name: 'Growth',
        slug: 'growth',
        description: 'For serious sellers ready to scale.',
        price: 999,
        yearlyPrice: 9999,
        maxProducts: 500,
        customDomainAccess: true,
        advancedAnalytics: true,
        premiumThemes: true,
        features: ['Up to 500 products', 'Advanced analytics', 'Custom domain', 'Premium themes', 'Priority support'],
        status: 'ACTIVE',
        sortOrder: 2,
      },
    });
    console.log('  ✓ Growth plan:', growth.id);

    const enterprise = await prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For high-volume businesses needing full power.',
        price: 2999,
        yearlyPrice: 29999,
        maxProducts: 999999,
        customDomainAccess: true,
        advancedAnalytics: true,
        premiumThemes: true,
        features: ['Unlimited products', 'Advanced analytics', 'Custom domain', 'Premium themes', 'Dedicated support', 'API access'],
        status: 'ACTIVE',
        sortOrder: 3,
      },
    });
    console.log('  ✓ Enterprise plan:', enterprise.id);
  } else {
    console.log(`\n✓ ${existingPlans} plan(s) already exist — skipping plan seeding.`);
  }

  console.log('\n✅ Production seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
