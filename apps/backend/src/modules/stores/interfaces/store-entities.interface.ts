// apps/backend/src/modules/stores/interfaces/store-entities.interface.ts

export interface StoreEntity {
  id: string;
  slug: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  ownerId: string;
  customDomain: string | null;
  domainStatus: 'NONE' | 'PENDING' | 'CONNECTED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDetailsEntity {
  id: string;
  storeId: string;
  businessType: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  description: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSettingsEntity {
  id: string;
  storeId: string;
  brandsEnabled: boolean;
  ordersEnabled: boolean;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  whatsappOrderEnabled: boolean;
  stockManagementType: 'AVAILABILITY' | 'QUANTITY' | 'COLOR_WISE' | null;
  colorWiseStockType: 'AVAILABILITY' | 'QUANTITY' | null;
  shippingType: 'FREE' | 'FIXED' | 'ORDER_AMOUNT' | 'WEIGHT_BASED' | null;
  shippingFixedCharge: number | null;
  shippingMinOrderAmount: number | null;
  shippingFallbackCharge: number | null;
  shippingDefaultWeight: number | null;
  shippingWeightRates: Array<{ upToKg: number; rate: number }> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeSettingsEntity {
  id: string;
  storeId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  navbarBg: string;
  navbarText: string;
  buttonBg: string | null;
  buttonText: string | null;
  h1Color: string | null;
  h2Color: string | null;
  paragraphColor: string | null;
  buttonShape: 'SQUARE' | 'ROUNDED' | 'MEDIUM_ROUNDED' | 'PILL';
  primaryFont: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHoursEntity {
  id: string;
  storeId: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface HomePageEntity {
  id: string;
  storeId: string;
  heroEnabled: boolean;
  heroType: 'IMAGE' | 'SLIDER' | 'VIDEO';
  heroHeading: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  heroImageUrl: string | null;
  heroImagePublicId: string | null;
  heroCtaText: string | null;
  heroButtonLinkType: 'CATEGORY' | 'PRODUCT' | 'CUSTOM' | null;
  heroButtonLinkValue: string | null;
  heroBanners: Array<Record<string, unknown>> | null;
  brandSectionEnabled: boolean;
  brandShape: 'CIRCLE' | 'SQUARE' | 'ROUNDED';
  categorySectionEnabled: boolean;
  categoryShape: 'CIRCLE' | 'SQUARE' | 'ROUNDED';
  categoryRadius: string | null;
  newArrivalEnabled: boolean;
  offerBanners: Array<Record<string, unknown>> | null;
  bestSellerEnabled: boolean;
  testimonialSectionEnabled: boolean;
  testimonials: Array<Record<string, unknown>> | null;
  allProductsEnabled: boolean;
  productCardRadius: string | null;
  showSalePrice: boolean;
  showOriginalPrice: boolean;
  whatsappEnabled: boolean;
  headerDeliveryInfo: string | null;
  showAccountIcon: boolean;
  aboutEnabled: boolean;
  aboutHeading: string | null;
  aboutContent: string | null;
  aboutImageUrl: string | null;
  aboutImagePublicId: string | null;
  vision: string | null;
  mission: string | null;
  badges: Array<Record<string, unknown>> | null;
  contactEnabled: boolean;
  deliveryPolicyHeading: string | null;
  deliveryPolicyDescription: string | null;
  deliveryPoints: string[] | null;
  refundPolicyHeading: string | null;
  refundPolicyDescription: string | null;
  refundPoints: string[] | null;
  privacyPolicyHeading: string | null;
  privacyPolicyDescription: string | null;
  privacyPoints: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreWithDetails extends StoreEntity {
  company: CompanyDetailsEntity | null;
  settings: StoreSettingsEntity | null;
  theme: ThemeSettingsEntity | null;
  workingHours?: WorkingHoursEntity[];
  subscription?: {
    id: string;
    storeId: string;
    planId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    plan?: {
      id: string;
      name: string;
      price: number;
      durationDays: number;
      features: Record<string, unknown> | null;
    } | null;
  } | null;
}

export interface StorefrontConfig {
  id: string;
  slug: string;
  name: string;
  status: string;
  customDomain: string | null;
  domainStatus: string;
  company: Partial<CompanyDetailsEntity> | null;
  settings: Partial<StoreSettingsEntity> | null;
  theme: Partial<ThemeSettingsEntity> | null;
  homePage: HomePageEntity | null;
  workingHours: WorkingHoursEntity[];
  merchantPaymentConfig: Array<{ isActive: boolean }>;
  authConfig: { googleEnabled: boolean; googleClientId: string | null } | null;
}

