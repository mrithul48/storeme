"use strict";
// packages/shared-types/src/index.ts
// Shared domain and application types for LaunchCommerce
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockManagementType = exports.OrderChannel = exports.PaymentStatus = exports.OrderStatus = exports.BrandStatus = exports.CategoryStatus = exports.ProductStatus = exports.StoreStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["PLATFORM_ADMIN"] = "PLATFORM_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var StoreStatus;
(function (StoreStatus) {
    StoreStatus["ACTIVE"] = "ACTIVE";
    StoreStatus["INACTIVE"] = "INACTIVE";
    StoreStatus["SUSPENDED"] = "SUSPENDED";
})(StoreStatus || (exports.StoreStatus = StoreStatus = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["INACTIVE"] = "INACTIVE";
    ProductStatus["DRAFT"] = "DRAFT";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var CategoryStatus;
(function (CategoryStatus) {
    CategoryStatus["ACTIVE"] = "ACTIVE";
    CategoryStatus["INACTIVE"] = "INACTIVE";
})(CategoryStatus || (exports.CategoryStatus = CategoryStatus = {}));
var BrandStatus;
(function (BrandStatus) {
    BrandStatus["ACTIVE"] = "ACTIVE";
    BrandStatus["INACTIVE"] = "INACTIVE";
})(BrandStatus || (exports.BrandStatus = BrandStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var OrderChannel;
(function (OrderChannel) {
    OrderChannel["COD"] = "COD";
    OrderChannel["ONLINE_PAYMENT"] = "ONLINE_PAYMENT";
    OrderChannel["WHATSAPP"] = "WHATSAPP";
})(OrderChannel || (exports.OrderChannel = OrderChannel = {}));
var StockManagementType;
(function (StockManagementType) {
    StockManagementType["AVAILABILITY"] = "AVAILABILITY";
    StockManagementType["QUANTITY"] = "QUANTITY";
    StockManagementType["COLOR_WISE"] = "COLOR_WISE";
})(StockManagementType || (exports.StockManagementType = StockManagementType = {}));
