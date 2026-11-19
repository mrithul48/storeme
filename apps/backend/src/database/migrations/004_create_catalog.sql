-- 004_create_catalog.sql

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "imagePublicId" TEXT,
  "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_storeId_slug_key" UNIQUE ("storeId", "slug")
);

CREATE TABLE IF NOT EXISTS "Brand" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "logoPublicId" TEXT,
  "status" "BrandStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Brand_storeId_slug_key" UNIQUE ("storeId", "slug")
);

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "salePrice" DECIMAL(10, 2),
  "sku" TEXT,
  "weight" DECIMAL(10, 2),
  "stock" INTEGER NOT NULL DEFAULT 0,
  "manageStock" BOOLEAN NOT NULL DEFAULT FALSE,
  "manageStockQuantity" BOOLEAN NOT NULL DEFAULT FALSE,
  "manageStockAvailability" BOOLEAN NOT NULL DEFAULT FALSE,
  "inStock" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
  "brandId" TEXT REFERENCES "Brand"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_storeId_slug_key" UNIQUE ("storeId", "slug")
);

CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "color" TEXT NOT NULL,
  "manageAvailability" BOOLEAN NOT NULL DEFAULT FALSE,
  "inStock" BOOLEAN NOT NULL DEFAULT TRUE,
  "manageQuantity" BOOLEAN NOT NULL DEFAULT FALSE,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductVariant_productId_color_key" UNIQUE ("productId", "color")
);

CREATE TABLE IF NOT EXISTS "ProductVariantImage" (
  "id" TEXT PRIMARY KEY,
  "variantId" TEXT NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

