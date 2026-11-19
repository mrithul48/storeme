// apps/mobile/src/types/index.ts
// Strict TypeScript types for LaunchCommerce Merchant Mobile Application

export type UserRole = "USER" | "PLATFORM_ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface StoreCompany {
  id?: string;
  storeId?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  businessType?: string;
  description?: string | null;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  socialLinks?: Record<string, string> | null;
}

export interface StoreTheme {
  id?: string;
  storeId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  navbarBg?: string;
  navbarText?: string;
  buttonBg?: string | null;
  buttonText?: string | null;
  buttonShape?: "SQUARE" | "ROUNDED" | "MEDIUM_ROUNDED" | "PILL";
  primaryFont?: string;
  fontFamily?: string;
}

export interface StoreSettings {
  id?: string;
  storeId?: string;
  brandsEnabled: boolean;
  ordersEnabled: boolean;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  whatsappOrderEnabled: boolean;
  stockManagementType?: "AVAILABILITY" | "QUANTITY" | "COLOR_WISE" | null;
  colorWiseStockType?: "AVAILABILITY" | "QUANTITY" | null;
  shippingType?: "FREE" | "FIXED" | "ORDER_AMOUNT" | "WEIGHT_BASED" | null;
  shippingFixedCharge?: number | null;
  shippingMinOrderAmount?: number | null;
  shippingFallbackCharge?: number | null;
  shippingDefaultWeight?: number | null;
}

export interface StorePolicies {
  deliveryPolicyHeading?: string | null;
  deliveryPolicyDescription?: string | null;
  deliveryPoints?: string[] | null;
  refundPolicyHeading?: string | null;
  refundPolicyDescription?: string | null;
  refundPoints?: string[] | null;
  privacyPolicyHeading?: string | null;
  privacyPolicyDescription?: string | null;
  privacyPoints?: string[] | null;
}

export interface CustomDomainDetails {
  domain: string | null;
  status: "NONE" | "PENDING" | "CONNECTED" | "FAILED";
  cnameRecord?: string;
  txtRecord?: string;
  verifiedAt?: string | null;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  ownerId: string;
  customDomain?: string | null;
  domainStatus?: "NONE" | "PENDING" | "CONNECTED" | "FAILED" | string | null;
  company?: StoreCompany | null;
  settings?: StoreSettings | null;
  theme?: StoreTheme | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreWithDetails extends Store {
  policies?: StorePolicies | null;
  workingHours?: Array<{
    id: string;
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>;
  subscription?: {
    id: string;
    storeId: string;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan?: {
      id: string;
      name: string;
      price: number;
    } | null;
  } | null;
}

export interface UpdateStorePayload {
  name?: string;
  company?: Partial<StoreCompany>;
  settings?: Partial<StoreSettings>;
}

export interface UpdateThemePayload {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  navbarBg?: string;
  navbarText?: string;
  buttonBg?: string;
  buttonText?: string;
  buttonShape?: "SQUARE" | "ROUNDED" | "MEDIUM_ROUNDED" | "PILL";
  primaryFont?: string;
}

export interface UpdatePoliciesPayload {
  deliveryPolicyHeading?: string | null;
  deliveryPolicyDescription?: string | null;
  deliveryPoints?: string[] | null;
  refundPolicyHeading?: string | null;
  refundPolicyDescription?: string | null;
  refundPoints?: string[] | null;
  privacyPolicyHeading?: string | null;
  privacyPolicyDescription?: string | null;
  privacyPoints?: string[] | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
}

export interface LoginResponse {
  user: User;
  store: Store | null;
  tokens: AuthTokens;
  session?: DeviceSession;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface ProductImage {
  id?: string;
  url: string;
  publicId: string;
  altText?: string | null;
  sortOrder?: number;
}

export interface ProductVariant {
  id?: string;
  color: string;
  manageAvailability?: boolean;
  inStock?: boolean;
  manageQuantity?: boolean;
  stock?: number;
  sortOrder?: number;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  sku?: string | null;
  stock: number;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  inStock: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  featured: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
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

export type StockOperation = "INCREMENT" | "DECREMENT" | "SET";

export interface AdjustStockPayload {
  productId: string;
  variantId?: string;
  operation: StockOperation;
  quantity: number;
  reason?: string;
}

export interface AdjustStockResult {
  productId: string;
  variantId?: string;
  color?: string;
  operation: StockOperation;
  adjustedQuantity: number;
  newStock: number;
  reason?: string;
}

export interface InventoryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
  threshold?: number;
}

export interface InventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockUnits: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderCustomer {
  id?: string;
  name: string;
  email: string | null;
  phone?: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string | null;
  variantId?: string | null;
  variantColor?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  product?: {
    images?: Array<{ url: string; altText?: string | null }>;
  };
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  orderChannel: "COD" | "ONLINE_PAYMENT" | "WHATSAPP";
  notes?: string | null;
  shippingAddress: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    name?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  totalOrders: number;
  grossSales: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
}

export interface CustomerOrderSummary {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  storeId?: string;
  name: string;
  email: string | null;
  phone?: string | null;
  username?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  createdAt: string;
}

export interface CustomerDetail {
  id: string;
  storeId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address?: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  orders: CustomerOrderSummary[];
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type AnalyticsTimeframe = "7d" | "30d" | "90d" | "1y";

export interface AnalyticsTopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export type TopProductAnalytics = AnalyticsTopProduct;

export interface SalesBucket {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsMetrics {
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface AnalyticsChannels {
  cod: number;
  online: number;
  whatsapp: number;
}

export interface StoreAnalyticsResponse {
  hasOrders: boolean;
  timeframe: string;
  metrics: AnalyticsMetrics;
  channels: AnalyticsChannels;
  topProducts: AnalyticsTopProduct[];
  salesOverTime: SalesBucket[];
}

export interface StoreDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  revenue: number;
}

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIAL";
export type BillingPeriod = "MONTHLY" | "YEARLY";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  yearlyPrice?: number | null;
  durationDays?: number;
  features?: string[] | null;
  maxProducts: number | null;
  maxOrders?: number | null;
  maxImages?: number | null;
  maxMonthlyOrders?: number | null;
  customDomainAccess: boolean;
  advancedAnalytics: boolean;
  premiumThemes: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  isPublic?: boolean;
  badge?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DEPRECATED";
}

export interface PlanLimitStatus {
  allowed: boolean;
  currentProducts: number;
  maxProducts: number;
  planName: string;
  customDomainAccess: boolean;
  advancedAnalytics: boolean;
  premiumThemes: boolean;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  razorpayPaymentId?: string | null;
  createdAt: string;
}

export interface SubscriptionDetail {
  id: string;
  storeId: string;
  planId: string;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  razorpaySubscriptionId?: string | null;
  razorpayPaymentId?: string | null;
  plan: Plan;
}

export interface Subscription {
  id: string;
  storeId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: Plan;
}

export interface CurrentSubscriptionResponse {
  subscription: SubscriptionDetail | null;
  limits: PlanLimitStatus;
  payments: SubscriptionPayment[];
}

export interface SubscriptionCheckoutResponse {
  orderId: string;
  amount: number;
  amountInRupees: number;
  currency: string;
  keyId: string;
  billingPeriod: BillingPeriod;
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    yearlyPrice?: number | null;
  };
  merchant: {
    name?: string | null;
    email?: string | null;
    storeName: string;
  };
}

export interface SubscriptionVerifyPayload {
  planId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  billingPeriod?: BillingPeriod;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

