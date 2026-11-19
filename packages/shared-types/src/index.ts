// packages/shared-types/src/index.ts
// Shared domain and application types for LaunchCommerce

export enum UserRole {
  USER = "USER",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
}

export enum StoreStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

export enum CategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum BrandStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum OrderChannel {
  COD = "COD",
  ONLINE_PAYMENT = "ONLINE_PAYMENT",
  WHATSAPP = "WHATSAPP",
}

export enum StockManagementType {
  AVAILABILITY = "AVAILABILITY",
  QUANTITY = "QUANTITY",
  COLOR_WISE = "COLOR_WISE",
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}

export interface StoreContext {
  id: string;
  slug: string;
  name: string;
  status: StoreStatus;
  ownerId: string;
  customDomain: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceSessionInfo {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
  ipAddress?: string | null;
  lastActiveAt: Date;
  isRevoked: boolean;
}

export interface DashboardKPIs {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  revenue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT & INVENTORY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductImageDto {
  id?: string;
  url: string;
  publicId: string;
  altText?: string | null;
  sortOrder?: number;
}

export interface ProductVariantDto {
  id?: string;
  color: string;
  manageAvailability?: boolean;
  inStock?: boolean;
  manageQuantity?: boolean;
  stock?: number;
  sortOrder?: number;
  images?: ProductImageDto[];
}

export interface ProductDto {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  sku?: string | null;
  weight?: number | null;
  stock: number;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  inStock: boolean;
  status: ProductStatus;
  featured: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemDto {
  productId: string;
  productName: string;
  sku?: string | null;
  stock: number;
  inStock: boolean;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  variants: {
    id: string;
    color: string;
    stock: number;
    inStock: boolean;
    manageQuantity: boolean;
    manageAvailability: boolean;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY & BRAND TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status: CategoryStatus;
  sortOrder: number;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandDto {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  status: BrandStatus;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku?: string | null;
  variantId?: string | null;
  variantColor?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderCustomerDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface OrderDto {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId: string;
  customer: OrderCustomerDto;
  items: OrderItemDto[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  orderChannel: OrderChannel;
  notes?: string | null;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment?: {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    razorpayOrderId?: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummaryDto {
  totalOrders: number;
  grossSales: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: OrderDto[];
}
