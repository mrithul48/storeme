// Shared types for the Live Store Design feature

export interface Category { id: string; name: string; slug: string }
export interface Product { id: string; name: string; slug: string }

export interface HeroBanner {
  url: string;
  publicId: string;
  mobileUrl?: string | null;
  mobilePublicId?: string | null;
  sortOrder: number;
}
export interface OfferBanner {
  url: string;
  publicId: string;
  linkType?: "CATEGORY" | "PRODUCT" | null;
  linkValue?: string | null;
  borderRadius?: "NONE" | "SM" | "MD" | "LG" | null;
}
export interface Testimonial {
  id: string;
  name: string;
  description: string;
  rating: number;
  bgColor?: string | null;
  sortOrder: number;
}
export interface Badge {
  id: string;
  icon?: string | null;
  iconPublicId?: string | null;
  text: string;
  sortOrder: number;
}

export interface StoreDesignClientProps {
  storeSlug: string;
  homePage: Record<string, unknown> | null;
  categories: Category[];
  products: Product[];
}

/** All the state fields lifted into the parent orchestrator */
export interface DesignState {
  // Hero
  heroEnabled: boolean;
  heroType?: "SLIDER";
  heroBanners: HeroBanner[];
  // Sections
  brandSectionEnabled: boolean;
  brandShape: string;
  categorySectionEnabled: boolean;
  categoryShape: string;
  categoryRadius: string;
  newArrivalEnabled: boolean;
  offerBanners: OfferBanner[];
  bestSellerEnabled: boolean;
  testimonialSectionEnabled: boolean;
  testimonials: Testimonial[];
  allProductsEnabled: boolean;
  // Product card
  productCardRadius: string;
  showSalePrice: boolean;
  showOriginalPrice: boolean;
  // WhatsApp
  whatsappEnabled: boolean;
  // Header
  headerDeliveryInfo: string;
  // About
  aboutEnabled: boolean;
  aboutHeading: string;
  aboutContent: string;
  aboutImageUrl: string;
  aboutImagePublicId: string;
  vision: string;
  mission: string;
  badges: Badge[];
  // Contact
  contactEnabled: boolean;
}

/** Setters — one per state field */
export type DesignSetters = {
  setHeroEnabled: (v: boolean) => void;
  setHeroType: (v: "CONTENT" | "SLIDER") => void;
  setHeroHeading: (v: string) => void;
  setHeroSubtitle: (v: string) => void;
  setHeroDescription: (v: string) => void;
  setHeroImageUrl: (v: string) => void;
  setHeroImagePublicId: (v: string) => void;
  setHeroCtaText: (v: string) => void;
  setHeroButtonLinkType: (v: "SHOP" | "CATEGORY" | "PRODUCT") => void;
  setHeroButtonLinkValue: (v: string) => void;
  setHeroBanners: React.Dispatch<React.SetStateAction<HeroBanner[]>>;
  setBrandSectionEnabled: (v: boolean) => void;
  setBrandShape: (v: string) => void;
  setCategorySectionEnabled: (v: boolean) => void;
  setCategoryShape: (v: string) => void;
  setCategoryRadius: (v: string) => void;
  setNewArrivalEnabled: (v: boolean) => void;
  setOfferBanners: React.Dispatch<React.SetStateAction<OfferBanner[]>>;
  setBestSellerEnabled: (v: boolean) => void;
  setTestimonialSectionEnabled: (v: boolean) => void;
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  setAllProductsEnabled: (v: boolean) => void;
  setProductCardRadius: (v: string) => void;
  setShowSalePrice: (v: boolean) => void;
  setShowOriginalPrice: (v: boolean) => void;
  setWhatsappEnabled: (v: boolean) => void;
  setHeaderDeliveryInfo: (v: string) => void;
  setAboutEnabled: (v: boolean) => void;
  setAboutHeading: (v: string) => void;
  setAboutContent: (v: string) => void;
  setAboutImageUrl: (v: string) => void;
  setAboutImagePublicId: (v: string) => void;
  setVision: (v: string) => void;
  setMission: (v: string) => void;
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
  setContactEnabled: (v: boolean) => void;
};

import React from "react";

/** Tiny helper: generate a random ID for new list items */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}
