-- 006_create_subscriptions_and_billing.sql

CREATE TABLE IF NOT EXISTS "Plan" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE,
  "price" DECIMAL(10, 2) NOT NULL,
  "yearlyPrice" DECIMAL(10, 2),
  "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
  "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "maxProducts" INTEGER,
  "maxOrders" INTEGER,
  "maxImages" INTEGER,
  "maxMonthlyOrders" INTEGER,
  "customDomainAccess" BOOLEAN NOT NULL DEFAULT FALSE,
  "advancedAnalytics" BOOLEAN NOT NULL DEFAULT FALSE,
  "premiumThemes" BOOLEAN NOT NULL DEFAULT FALSE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
  "badge" TEXT,
  "limits" JSONB,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "planId" TEXT NOT NULL REFERENCES "Plan"("id"),
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "billingPeriod" TEXT NOT NULL DEFAULT 'YEARLY',
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT FALSE,
  "cancelledAt" TIMESTAMP(3),
  "currentPeriodStart" TIMESTAMP(3) NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "razorpayPaymentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT UNIQUE REFERENCES "Order"("id"),
  "subscriptionId" TEXT UNIQUE REFERENCES "Subscription"("id"),
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "razorpaySignature" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

