"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  AlertCircle,
  Layout,
  Tag,
  Info,
  MessageCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  StoreDesignClientProps,
  HeroBanner,
  OfferBanner,
  Testimonial,
  Badge,
  genId,
} from "./_ui/types";
import { HomepageTab } from "./tabs/homepage-tab";
import { HeaderTab } from "./tabs/header-tab";
import { AboutTab } from "./tabs/about-tab";
import { ContactTab } from "./tabs/contact-tab";

// ─── Main Component ───────────────────────────────────────────────────────────

export function StoreDesignClient({
  storeSlug,
  homePage,
  categories,
  products,
}: StoreDesignClientProps) {
  const router = useRouter();
  const hp = homePage as Record<string, unknown> | null;

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<"homepage" | "header" | "about" | "contact">("homepage");

  // ── Notifications ──
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Hero ──
  const [heroEnabled, setHeroEnabled] = useState<boolean>((hp?.heroEnabled as boolean) ?? true);
  const [heroType, setHeroType] = useState<"CONTENT" | "SLIDER">(
    (hp?.heroType as "CONTENT" | "SLIDER") ?? "CONTENT"
  );
  const [heroHeading, setHeroHeading] = useState<string>((hp?.heroHeading as string) ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState<string>((hp?.heroSubtitle as string) ?? "");
  const [heroDescription, setHeroDescription] = useState<string>((hp?.heroDescription as string) ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState<string>((hp?.heroImageUrl as string) ?? "");
  const [heroImagePublicId, setHeroImagePublicId] = useState<string>((hp?.heroImagePublicId as string) ?? "");
  const [heroCtaText, setHeroCtaText] = useState<string>((hp?.heroCtaText as string) ?? "");
  const [heroButtonLinkType, setHeroButtonLinkType] = useState<"SHOP" | "CATEGORY" | "PRODUCT">(
    (hp?.heroButtonLinkType as "SHOP" | "CATEGORY" | "PRODUCT") ?? "SHOP"
  );
  const [heroButtonLinkValue, setHeroButtonLinkValue] = useState<string>(
    (hp?.heroButtonLinkValue as string) ?? ""
  );
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => {
    const b = hp?.heroBanners;
    return Array.isArray(b) ? (b as HeroBanner[]) : [];
  });

  // ── Brand ──
  const [brandSectionEnabled, setBrandSectionEnabled] = useState<boolean>(
    (hp?.brandSectionEnabled as boolean) ?? false
  );
  const [brandShape, setBrandShape] = useState<string>((hp?.brandShape as string) ?? "SQUARE");

  // ── Category ──
  const [categorySectionEnabled, setCategorySectionEnabled] = useState<boolean>(
    (hp?.categorySectionEnabled as boolean) ?? true
  );
  const [categoryShape, setCategoryShape] = useState<string>((hp?.categoryShape as string) ?? "SQUARE");
  const [categoryRadius, setCategoryRadius] = useState<string>((hp?.categoryRadius as string) ?? "MD");

  // ── New Arrival ──
  const [newArrivalEnabled, setNewArrivalEnabled] = useState<boolean>(
    (hp?.newArrivalEnabled as boolean) ?? true
  );

  // ── Offer Banners ──
  const [offerBanners, setOfferBanners] = useState<OfferBanner[]>(() => {
    const b = hp?.offerBanners;
    return Array.isArray(b) ? (b as OfferBanner[]) : [{} as OfferBanner, {} as OfferBanner];
  });

  // ── Best Seller ──
  const [bestSellerEnabled, setBestSellerEnabled] = useState<boolean>(
    (hp?.bestSellerEnabled as boolean) ?? true
  );

  // ── Testimonials ──
  const [testimonialSectionEnabled, setTestimonialSectionEnabled] = useState<boolean>(
    (hp?.testimonialSectionEnabled as boolean) ?? false
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const t = hp?.testimonials;
    return Array.isArray(t) ? (t as Testimonial[]) : [];
  });

  // ── All Products ──
  const [allProductsEnabled, setAllProductsEnabled] = useState<boolean>(
    (hp?.allProductsEnabled as boolean) ?? true
  );

  // ── Product Card ──
  const [productCardRadius, setProductCardRadius] = useState<string>(
    (hp?.productCardRadius as string) ?? "LG"
  );
  const [showSalePrice, setShowSalePrice] = useState<boolean>((hp?.showSalePrice as boolean) ?? true);
  const [showOriginalPrice, setShowOriginalPrice] = useState<boolean>(
    (hp?.showOriginalPrice as boolean) ?? true
  );

  // ── WhatsApp ──
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(
    (hp?.whatsappEnabled as boolean) ?? false
  );

  // ── Header ──
  const [headerDeliveryInfo, setHeaderDeliveryInfo] = useState<string>(
    (hp?.headerDeliveryInfo as string) ?? ""
  );
  const [showAccountIcon, setShowAccountIcon] = useState<boolean>(
    (hp?.showAccountIcon as boolean) ?? true
  );

  // ── About ──
  const [aboutEnabled, setAboutEnabled] = useState<boolean>((hp?.aboutEnabled as boolean) ?? false);
  const [aboutHeading, setAboutHeading] = useState<string>((hp?.aboutHeading as string) ?? "");
  const [aboutContent, setAboutContent] = useState<string>((hp?.aboutContent as string) ?? "");
  const [aboutImageUrl, setAboutImageUrl] = useState<string>((hp?.aboutImageUrl as string) ?? "");
  const [aboutImagePublicId, setAboutImagePublicId] = useState<string>(
    (hp?.aboutImagePublicId as string) ?? ""
  );
  const [vision, setVision] = useState<string>((hp?.vision as string) ?? "");
  const [mission, setMission] = useState<string>((hp?.mission as string) ?? "");
  const [badges, setBadges] = useState<Badge[]>(() => {
    const b = hp?.badges;
    return Array.isArray(b) ? (b as Badge[]) : [];
  });

  // ── Contact ──
  const [contactEnabled, setContactEnabled] = useState<boolean>(
    (hp?.contactEnabled as boolean) ?? false
  );

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    const payload = {
      heroEnabled,
      heroType,
      heroHeading: heroHeading || null,
      heroSubtitle: heroSubtitle || null,
      heroDescription: heroDescription || null,
      heroImageUrl: heroImageUrl || null,
      heroImagePublicId: heroImagePublicId || null,
      heroCtaText: heroCtaText || null,
      heroButtonLinkType: heroButtonLinkType ?? "SHOP",
      heroButtonLinkValue: heroButtonLinkType !== "SHOP" ? heroButtonLinkValue || null : null,
      heroBanners: heroBanners.filter((b) => b.url),
      brandSectionEnabled,
      brandShape,
      categorySectionEnabled,
      categoryShape,
      categoryRadius,
      newArrivalEnabled,
      offerBanners: offerBanners.filter((b) => b.url),
      bestSellerEnabled,
      testimonialSectionEnabled,
      testimonials,
      allProductsEnabled,
      productCardRadius,
      showSalePrice,
      showOriginalPrice,
      whatsappEnabled,
      headerDeliveryInfo: headerDeliveryInfo || null,
      showAccountIcon,
      aboutEnabled,
      aboutHeading: aboutHeading || null,
      aboutContent: aboutContent || null,
      aboutImageUrl: aboutImageUrl || null,
      aboutImagePublicId: aboutImagePublicId || null,
      vision: vision || null,
      mission: mission || null,
      badges,
      contactEnabled,
    };

    try {
      const res = await fetch("/api/stores/current/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save");
      setSuccess("Live Store Design saved! Changes are live on your storefront.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save design settings.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Testimonial helpers ───────────────────────────────────────────────────

  const addTestimonial = () => {
    if (testimonials.length >= 5) return;
    setTestimonials((prev) => [
      ...prev,
      { id: genId(), name: "", description: "", rating: 5, bgColor: "#1e293b", sortOrder: prev.length },
    ]);
  };

  const updateTestimonial = (idx: number, field: keyof Testimonial, value: unknown) => {
    setTestimonials((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  };

  const removeTestimonial = (idx: number) => {
    setTestimonials((prev) =>
      prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, sortOrder: i }))
    );
  };

  // ─── Badge helpers ─────────────────────────────────────────────────────────

  const addBadge = () => {
    setBadges((prev) => [
      ...prev,
      { id: genId(), icon: null, iconPublicId: null, text: "", sortOrder: prev.length },
    ]);
  };

  const updateBadge = (idx: number, field: keyof Badge, value: unknown) => {
    setBadges((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const removeBadge = (idx: number) => {
    setBadges((prev) =>
      prev.filter((_, i) => i !== idx).map((b, i) => ({ ...b, sortOrder: i }))
    );
  };

  // ─── Offer Banner helpers ─────────────────────────────────────────────────

  const updateOfferBanner = (idx: number, update: Partial<OfferBanner>) => {
    setOfferBanners((prev) => prev.map((b, i) => (i === idx ? { ...b, ...update } : b)));
  };

  // ─── Hero Banner helpers ──────────────────────────────────────────────────

  const addHeroBanner = (result: { url: string; publicId: string }) => {
    setHeroBanners((prev) => {
      if (prev.length >= 3) return prev;
      return [...prev, { ...result, sortOrder: prev.length }];
    });
  };

  const removeHeroBanner = (idx: number) => {
    setHeroBanners((prev) =>
      prev.filter((_, i) => i !== idx).map((b, i) => ({ ...b, sortOrder: i }))
    );
  };

  // ─── Tab Buttons ──────────────────────────────────────────────────────────

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: "homepage", label: "Homepage", icon: Layout },
    { id: "header", label: "Header", icon: Tag },
    { id: "about", label: "About & Vision", icon: Info },
    { id: "contact", label: "Contact Page", icon: MessageCircle },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-emerald-300 hover:text-emerald-100 text-xs underline"
          >
            <Eye className="w-3.5 h-3.5" /> View Live Store
          </a>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Store Banner */}
      <Card className="flex items-center justify-between py-3 px-5 bg-gradient-to-r from-blue-950/40 to-slate-900 border-blue-500/20">
        <div>
          <p className="text-xs font-semibold text-blue-400">Live Storefront</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Changes save to DB and appear live immediately after saving.
          </p>
        </div>
        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline" size="sm">
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview Store
          </Button>
        </a>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
              activeTab === id
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ TAB CONTENTS ════════════════════════════════ */}
      {activeTab === "homepage" && (
        <HomepageTab
          categories={categories}
          products={products}
          heroEnabled={heroEnabled}
          setHeroEnabled={setHeroEnabled}
          heroType={heroType}
          setHeroType={setHeroType}
          heroHeading={heroHeading}
          setHeroHeading={setHeroHeading}
          heroSubtitle={heroSubtitle}
          setHeroSubtitle={setHeroSubtitle}
          heroDescription={heroDescription}
          setHeroDescription={setHeroDescription}
          heroImageUrl={heroImageUrl}
          setHeroImageUrl={setHeroImageUrl}
          heroImagePublicId={heroImagePublicId}
          setHeroImagePublicId={setHeroImagePublicId}
          heroCtaText={heroCtaText}
          setHeroCtaText={setHeroCtaText}
          heroButtonLinkType={heroButtonLinkType}
          setHeroButtonLinkType={setHeroButtonLinkType}
          heroButtonLinkValue={heroButtonLinkValue}
          setHeroButtonLinkValue={setHeroButtonLinkValue}
          heroBanners={heroBanners}
          addHeroBanner={addHeroBanner}
          removeHeroBanner={removeHeroBanner}
          brandSectionEnabled={brandSectionEnabled}
          setBrandSectionEnabled={setBrandSectionEnabled}
          brandShape={brandShape}
          setBrandShape={setBrandShape}
          categorySectionEnabled={categorySectionEnabled}
          setCategorySectionEnabled={setCategorySectionEnabled}
          categoryShape={categoryShape}
          setCategoryShape={setCategoryShape}
          categoryRadius={categoryRadius}
          setCategoryRadius={setCategoryRadius}
          newArrivalEnabled={newArrivalEnabled}
          setNewArrivalEnabled={setNewArrivalEnabled}
          productCardRadius={productCardRadius}
          setProductCardRadius={setProductCardRadius}
          showSalePrice={showSalePrice}
          setShowSalePrice={setShowSalePrice}
          showOriginalPrice={showOriginalPrice}
          setShowOriginalPrice={setShowOriginalPrice}
          offerBanners={offerBanners}
          updateOfferBanner={updateOfferBanner}
          bestSellerEnabled={bestSellerEnabled}
          setBestSellerEnabled={setBestSellerEnabled}
          testimonialSectionEnabled={testimonialSectionEnabled}
          setTestimonialSectionEnabled={setTestimonialSectionEnabled}
          testimonials={testimonials}
          addTestimonial={addTestimonial}
          updateTestimonial={updateTestimonial}
          removeTestimonial={removeTestimonial}
          allProductsEnabled={allProductsEnabled}
          setAllProductsEnabled={setAllProductsEnabled}
          whatsappEnabled={whatsappEnabled}
          setWhatsappEnabled={setWhatsappEnabled}
        />
      )}

      {activeTab === "header" && (
        <HeaderTab
          headerDeliveryInfo={headerDeliveryInfo}
          setHeaderDeliveryInfo={setHeaderDeliveryInfo}
          showAccountIcon={showAccountIcon}
          setShowAccountIcon={setShowAccountIcon}
        />
      )}

      {activeTab === "about" && (
        <AboutTab
          aboutEnabled={aboutEnabled}
          setAboutEnabled={setAboutEnabled}
          aboutHeading={aboutHeading}
          setAboutHeading={setAboutHeading}
          aboutContent={aboutContent}
          setAboutContent={setAboutContent}
          aboutImageUrl={aboutImageUrl}
          setAboutImageUrl={setAboutImageUrl}
          aboutImagePublicId={aboutImagePublicId}
          setAboutImagePublicId={setAboutImagePublicId}
          vision={vision}
          setVision={setVision}
          mission={mission}
          setMission={setMission}
          badges={badges}
          addBadge={addBadge}
          updateBadge={updateBadge}
          removeBadge={removeBadge}
        />
      )}

      {activeTab === "contact" && (
        <ContactTab
          contactEnabled={contactEnabled}
          setContactEnabled={setContactEnabled}
        />
      )}

      {/* ── Global Save Button ─────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-10 flex items-center justify-end pt-4 pb-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Live Store Design"}
        </Button>
      </div>
    </div>
  );
}
