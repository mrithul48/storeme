-- 008_create_indexes.sql
-- Performance, lookup, and foreign key indexes

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_passwordResetToken_idx" ON "User"("passwordResetToken");

CREATE INDEX IF NOT EXISTS "DeviceSession_userId_idx" ON "DeviceSession"("userId");
CREATE INDEX IF NOT EXISTS "DeviceSession_deviceId_idx" ON "DeviceSession"("deviceId");
CREATE INDEX IF NOT EXISTS "DeviceSession_isRevoked_idx" ON "DeviceSession"("isRevoked");

CREATE INDEX IF NOT EXISTS "RefreshToken_sessionId_idx" ON "RefreshToken"("sessionId");
CREATE INDEX IF NOT EXISTS "RefreshToken_familyId_idx" ON "RefreshToken"("familyId");
CREATE INDEX IF NOT EXISTS "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_isUsed_idx" ON "RefreshToken"("isUsed");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

CREATE INDEX IF NOT EXISTS "Store_slug_idx" ON "Store"("slug");
CREATE INDEX IF NOT EXISTS "Store_ownerId_idx" ON "Store"("ownerId");
CREATE INDEX IF NOT EXISTS "Store_customDomain_idx" ON "Store"("customDomain");

CREATE INDEX IF NOT EXISTS "WorkingHours_storeId_idx" ON "WorkingHours"("storeId");
CREATE INDEX IF NOT EXISTS "StoreColor_storeId_idx" ON "StoreColor"("storeId");

CREATE INDEX IF NOT EXISTS "Category_storeId_idx" ON "Category"("storeId");
CREATE INDEX IF NOT EXISTS "Category_storeId_status_idx" ON "Category"("storeId", "status");

CREATE INDEX IF NOT EXISTS "Brand_storeId_idx" ON "Brand"("storeId");
CREATE INDEX IF NOT EXISTS "Brand_storeId_status_idx" ON "Brand"("storeId", "status");

CREATE INDEX IF NOT EXISTS "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX IF NOT EXISTS "Product_storeId_status_idx" ON "Product"("storeId", "status");
CREATE INDEX IF NOT EXISTS "Product_storeId_categoryId_idx" ON "Product"("storeId", "categoryId");
CREATE INDEX IF NOT EXISTS "Product_storeId_brandId_idx" ON "Product"("storeId", "brandId");
CREATE INDEX IF NOT EXISTS "Product_storeId_featured_idx" ON "Product"("storeId", "featured");
CREATE INDEX IF NOT EXISTS "Product_storeId_createdAt_idx" ON "Product"("storeId", "createdAt");

CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS "ProductVariantImage_variantId_idx" ON "ProductVariantImage"("variantId");

CREATE INDEX IF NOT EXISTS "Customer_storeId_idx" ON "Customer"("storeId");
CREATE INDEX IF NOT EXISTS "Customer_storeId_email_idx" ON "Customer"("storeId", "email");
CREATE INDEX IF NOT EXISTS "Customer_storeId_username_idx" ON "Customer"("storeId", "username");
CREATE INDEX IF NOT EXISTS "Customer_passwordResetToken_idx" ON "Customer"("passwordResetToken");

CREATE INDEX IF NOT EXISTS "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX IF NOT EXISTS "Order_storeId_status_idx" ON "Order"("storeId", "status");
CREATE INDEX IF NOT EXISTS "Order_storeId_paymentStatus_idx" ON "Order"("storeId", "paymentStatus");
CREATE INDEX IF NOT EXISTS "Order_storeId_orderChannel_idx" ON "Order"("storeId", "orderChannel");
CREATE INDEX IF NOT EXISTS "Order_storeId_createdAt_idx" ON "Order"("storeId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

CREATE INDEX IF NOT EXISTS "Subscription_storeId_idx" ON "Subscription"("storeId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

CREATE INDEX IF NOT EXISTS "Payment_razorpayOrderId_idx" ON "Payment"("razorpayOrderId");
CREATE INDEX IF NOT EXISTS "Payment_razorpayPaymentId_idx" ON "Payment"("razorpayPaymentId");

CREATE INDEX IF NOT EXISTS "MerchantPaymentConfig_storeId_idx" ON "MerchantPaymentConfig"("storeId");
CREATE INDEX IF NOT EXISTS "CustomDomain_domain_idx" ON "CustomDomain"("domain");
CREATE INDEX IF NOT EXISTS "CustomDomain_storeId_idx" ON "CustomDomain"("storeId");
CREATE INDEX IF NOT EXISTS "MerchantAuthConfig_storeId_idx" ON "MerchantAuthConfig"("storeId");

CREATE INDEX IF NOT EXISTS "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_entityType_idx" ON "AdminAuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

