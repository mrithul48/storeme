-- 005_create_customers_and_orders.sql

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT,
  "phone" TEXT,
  "password" TEXT,
  "googleId" TEXT,
  "passwordResetToken" TEXT,
  "passwordResetExpires" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Customer_storeId_email_key" UNIQUE ("storeId", "email")
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL REFERENCES "Store"("id") ON DELETE CASCADE,
  "orderNumber" TEXT NOT NULL,
  "customerId" TEXT NOT NULL REFERENCES "Customer"("id"),
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "shippingCharge" DECIMAL(10, 2) DEFAULT 0,
  "total" DECIMAL(10, 2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT,
  "orderChannel" "OrderChannel" NOT NULL DEFAULT 'COD',
  "notes" TEXT,
  "shippingAddress" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_storeId_orderNumber_key" UNIQUE ("storeId", "orderNumber")
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id"),
  "productName" TEXT NOT NULL,
  "productSku" TEXT,
  "variantId" TEXT,
  "variantColor" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL
);

