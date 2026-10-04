-- Backfill: preserve existing behavior after schema extension.
-- 1. Orders previously paid via Razorpay → ONLINE_PAYMENT channel
UPDATE "Order" SET "orderChannel" = 'ONLINE_PAYMENT' WHERE "paymentMethod" = 'RAZORPAY';
-- 2. Button background previously came from primaryColor
UPDATE "ThemeSettings" SET "buttonBg" = "primaryColor";
-- 3. Plan slugs for centralized feature gating (match existing plan names, no price changes)
UPDATE "Plan" SET "slug" = 'growth' WHERE "name" = 'Growth Plan' AND "slug" IS NULL;
UPDATE "Plan" SET "slug" = 'scale-pro' WHERE "name" = 'Scale Pro' AND "slug" IS NULL;
