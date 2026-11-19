// src/types/store.types.ts

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  navbarBg: string;
  navbarText: string;
  buttonShape: "SQUARE" | "MEDIUM_ROUNDED" | "FULLY_ROUNDED";
  primaryFont: string;
}

export interface WorkingHoursDay {
  dayOfWeek: number; // 0=Sun, 1=Mon ... 6=Sat
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export type WorkingHoursConfig = WorkingHoursDay[];

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface StoreWithRelations {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  company?: {
    businessType: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    logoPublicId?: string | null;
    socialLinks?: SocialLinks | null;
  } | null;
  settings?: {
    brandsEnabled: boolean;
    ordersEnabled: boolean;
  } | null;
  theme?: ThemeConfig | null;
  subscription?: {
    status: string;
    currentPeriodEnd: Date;
    plan: {
      name: string;
      price: number;
    };
  } | null;
}

export interface StoreConfigForStorefront {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  company: {
    businessType: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    socialLinks?: SocialLinks | null;
  } | null;
  settings: {
    brandsEnabled: boolean;
    ordersEnabled: boolean;
  } | null;
  theme: ThemeConfig | null;
  homePage: Record<string, unknown> | null;
}

export interface OnboardingData {
  // Step 1
  businessName: string;
  businessAddress?: string;
  logoUrl?: string;
  logoPublicId?: string;
  whatsapp?: string;
  email?: string;
  description?: string;
  phone?: string;
  socialLinks?: SocialLinks;
  // Step 2
  businessType: string;
  // Step 3
  workingHours?: WorkingHoursConfig;
  // Step 4
  theme?: Partial<ThemeConfig>;
}
