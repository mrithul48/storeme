-- 003_create_stores_and_settings.sql

CREATE TABLE IF NOT EXISTS "Store" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE',
  "ownerId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "customDomain" TEXT UNIQUE,
  "domainVerificationToken" TEXT UNIQUE,
  "domainStatus" "DomainStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CompanyDetails" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "businessType" TEXT NOT NULL,
  "address" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "description" TEXT,
  "logoUrl" TEXT,
  "logoPublicId" TEXT,
  "socialLinks" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "StoreSettings" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "brandsEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "ordersEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "codEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "onlinePaymentEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "whatsappOrderEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "stockManagementType" TEXT,
  "colorWiseStockType" TEXT,
  "shippingType" TEXT,
  "shippingFixedCharge" DECIMAL(10, 2),
  "shippingMinOrderAmount" DECIMAL(10, 2),
  "shippingFallbackCharge" DECIMAL(10, 2),
  "shippingDefaultWeight" DECIMAL(10, 2),
  "shippingWeightRates" JSONB,
  "razorpayKeyId" TEXT,
  "razorpaySecret" TEXT,
  "brevoApiKey" TEXT,
  "brevoSenderEmail" TEXT,
  "brevoSenderName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ThemeSettings" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "primaryColor" TEXT NOT NULL DEFAULT '#22c55e',
  "secondaryColor" TEXT NOT NULL DEFAULT '#f0fdf4',
  "accentColor" TEXT NOT NULL DEFAULT '#16a34a',
  "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
  "surfaceColor" TEXT NOT NULL DEFAULT '#f6faf7',
  "textColor" TEXT NOT NULL DEFAULT '#111827',
  "mutedTextColor" TEXT NOT NULL DEFAULT '#6b7280',
  "navbarBg" TEXT NOT NULL DEFAULT '#ffffff',
  "navbarText" TEXT NOT NULL DEFAULT '#111827',
  "buttonBg" TEXT NOT NULL DEFAULT '#22c55e',
  "buttonText" TEXT NOT NULL DEFAULT '#ffffff',
  "h1Color" TEXT NOT NULL DEFAULT '#111827',
  "h2Color" TEXT NOT NULL DEFAULT '#1f2937',
  "paragraphColor" TEXT NOT NULL DEFAULT '#374151',
  "buttonShape" "ButtonShape" NOT NULL DEFAULT 'MEDIUM_ROUNDED',
  "primaryFont" TEXT NOT NULL DEFAULT 'Inter',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WorkingHours" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "isOpen" BOOLEAN NOT NULL DEFAULT TRUE,
  "openTime" TEXT,
  "closeTime" TEXT,
  CONSTRAINT "WorkingHours_storeId_dayOfWeek_key" UNIQUE ("storeId", "dayOfWeek")
);

CREATE TABLE IF NOT EXISTS "StoreColor" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "hex" TEXT NOT NULL DEFAULT '#000000',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreColor_storeId_name_key" UNIQUE ("storeId", "name")
);

CREATE TABLE IF NOT EXISTS "MerchantPaymentConfig" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL DEFAULT 'razorpay',
  "keyId" TEXT NOT NULL,
  "encryptedSecret" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "mode" TEXT NOT NULL DEFAULT 'test',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MerchantPaymentConfig_storeId_provider_key" UNIQUE ("storeId", "provider")
);

CREATE TABLE IF NOT EXISTS "CustomDomain" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "domain" TEXT UNIQUE NOT NULL,
  "status" "CustomDomainStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "verificationToken" TEXT UNIQUE NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MerchantAuthConfig" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT UNIQUE NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "googleEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "googleClientId" TEXT,
  "encryptedGoogleClientSecret" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

