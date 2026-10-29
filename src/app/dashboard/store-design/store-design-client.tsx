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
  PolicyPoint,
  genId,
} from "./_ui/types";
import { HomepageTab } from "./tabs/homepage-tab";
import { HeaderTab } from "./tabs/header-tab";
import { AboutTab } from "./tabs/about-tab";
import { ContactTab } from "./tabs/contact-tab";
import { PoliciesTab } from "./tabs/policies-tab";
import { ShieldCheck } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"homepage" | "header" | "about" | "contact" | "policies">("homepage");

  // ── Notifications ──
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Hero (Image Slider only) ──
  const [heroEnabled, setHeroEnabled] = useState<boolean>((hp?.heroEnabled as boolean) ?? true);
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
    const arr = Array.isArray(b) ? (b as OfferBanner[]) : [];
    return [
      arr[0] ? { ...arr[0] } : ({} as OfferBanner),
      arr[1] ? { ...arr[1] } : ({} as OfferBanner),
    ];
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

  // ── Store Policies ──
  const [deliveryPolicyHeading, setDeliveryPolicyHeading] = useState<string>(
    (hp?.deliveryPolicyHeading as string) ?? ""
  );
  const [deliveryPoints, setDeliveryPoints] = useState<PolicyPoint[]>(() => {
    const p = hp?.deliveryPoints;
    return Array.isArray(p) ? (p as PolicyPoint[]) : [];
  });

  const [refundPolicyHeading, setRefundPolicyHeading] = useState<string>(
    (hp?.refundPolicyHeading as string) ?? ""
  );
  const [refundPoints, setRefundPoints] = useState<PolicyPoint[]>(() => {
    const p = hp?.refundPoints;
    return Array.isArray(p) ? (p as PolicyPoint[]) : [];
  });

  const [privacyPolicyHeading, setPrivacyPolicyHeading] = useState<string>(
    (hp?.privacyPolicyHeading as string) ?? ""
  );
  const [privacyPoints, setPrivacyPoints] = useState<PolicyPoint[]>(() => {
    const p = hp?.privacyPoints;
    return Array.isArray(p) ? (p as PolicyPoint[]) : [];
  });

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    const payload = {
      heroEnabled,
      heroType: "SLIDER",
      heroHeading: null,
      heroSubtitle: null,
      heroDescription: null,
      heroImageUrl: null,
      heroImagePublicId: null,
      heroCtaText: null,
      heroButtonLinkType: "SHOP",
      heroButtonLinkValue: null,
      heroBanners: heroBanners.filter((b) => b.url),
      brandSectionEnabled,
      brandShape,
      categorySectionEnabled,
      categoryShape,
      categoryRadius,
      newArrivalEnabled,
      offerBanners: offerBanners
        .filter((b) => Boolean(b?.url))
        .map((b) => ({
          url: b.url,
          publicId: b.publicId || "banner",
          linkType: b.linkType || null,
          linkValue: b.linkValue || null,
          borderRadius: b.borderRadius || "MD",
        })),
      bestSellerEnabled,
      testimonialSectionEnabled,
      testimonials,
      allProductsEnabled,
      productCardRadius,
      showSalePrice,
      showOriginalPrice,
      whatsappEnabled,
      headerDeliveryInfo: null,
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
      deliveryPolicyHeading: deliveryPolicyHeading || null,
      deliveryPolicyDescription: null,
      deliveryPoints: deliveryPoints.filter((p) => p.heading.trim() || p.description.trim()),
      refundPolicyHeading: refundPolicyHeading || null,
      refundPolicyDescription: null,
      refundPoints: refundPoints.filter((p) => p.heading.trim() || p.description.trim()),
      privacyPolicyHeading: privacyPolicyHeading || null,
      privacyPolicyDescription: null,
      privacyPoints: privacyPoints.filter((p) => p.heading.trim() || p.description.trim()),
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
    setBadges((prev) => {
      if (prev.length >= 4) return prev;
      return [
        ...prev,
        {
          id: genId(),
          count: "",
          heading: "",
          description: "",
          sortOrder: prev.length,
        },
      ];
    });
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
    setOfferBanners((prev) => {
      const next = [...prev];
      while (next.length <= idx) {
        next.push({} as OfferBanner);
      }
      next[idx] = { ...next[idx], ...update };
      return next;
    });
  };

  // ─── Hero Banner helpers ──────────────────────────────────────────────────

  const addHeroBanner = (result: { url: string; publicId: string }) => {
    setHeroBanners((prev) => {
      if (prev.length >= 3) return prev;
      return [...prev, { ...result, sortOrder: prev.length }];
    });
  };

  const updateHeroBanner = (idx: number, update: Partial<HeroBanner>) => {
    setHeroBanners((prev) => prev.map((b, i) => (i === idx ? { ...b, ...update } : b)));
  };

  const removeHeroBanner = (idx: number) => {
    setHeroBanners((prev) =>
      prev.filter((_, i) => i !== idx).map((b, i) => ({ ...b, sortOrder: i }))
    );
  };

  // ─── Tab Buttons ──────────────────────────────────────────────────────────

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: "homepage", label: "Home page", icon: Layout },
    { id: "header", label: "Header", icon: Tag },
    { id: "about", label: "About page", icon: Info },
    { id: "contact", label: "Contact Page", icon: MessageCircle },
    { id: "policies", label: "Store Policies", icon: ShieldCheck },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Title & Mobile-Friendly Save Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 sm:border-0 sm:pb-0">
        <div className="min-w-0 pr-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Live Store Design</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 line-clamp-1 sm:line-clamp-none">
            Customize your storefront homepage, sections, and banners. Changes appear live immediately.
          </p>
        </div>

      </div>

      {/* Notifications */}
      {success && (
        <div className="hidden sm:flex p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm items-center gap-2 shadow-sm">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-[#2563EB] hover:text-blue-800 text-xs font-semibold underline"
          >
            <Eye className="w-3.5 h-3.5" /> View Live Store
          </a>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Store Banner */}
      <div className="hidden sm:flex items-center justify-between py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 border border-blue-100/90 shadow-sm">
        <div>
          <p className="text-xs font-bold text-[#2563EB]">Live Storefront</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            Changes save to DB and appear live immediately after saving.
          </p>
        </div>
        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline" size="sm" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">
            <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#2563EB]" /> Preview Store
          </Button>
        </a>
      </div>

      {/* Tabs */}
      <div className="p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer select-none",
              activeTab === id
                ? "bg-white text-[#2563EB] shadow-xs border border-slate-200/80 font-bold"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 font-semibold"
            )}
          >
            <Icon className={`w-4 h-4 shrink-0 ${activeTab === id ? "text-[#2563EB]" : "text-slate-400"}`} />
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
          heroBanners={heroBanners}
          addHeroBanner={addHeroBanner}
          updateHeroBanner={updateHeroBanner}
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

      {activeTab === "policies" && (
        <PoliciesTab
          storeSlug={storeSlug}
          deliveryPolicyHeading={deliveryPolicyHeading}
          setDeliveryPolicyHeading={setDeliveryPolicyHeading}
          deliveryPoints={deliveryPoints}
          setDeliveryPoints={setDeliveryPoints}
          refundPolicyHeading={refundPolicyHeading}
          setRefundPolicyHeading={setRefundPolicyHeading}
          refundPoints={refundPoints}
          setRefundPoints={setRefundPoints}
          privacyPolicyHeading={privacyPolicyHeading}
          setPrivacyPolicyHeading={setPrivacyPolicyHeading}
          privacyPoints={privacyPoints}
          setPrivacyPoints={setPrivacyPoints}
        />
      )}

      {/* ── Global Save Button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 p-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 sm:pt-6 sm:pb-4 sm:flex sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
          className="w-full sm:w-auto h-11 sm:h-12 py-2.5 sm:py-3.5 px-4 sm:px-6 text-sm sm:text-base rounded-xl sm:rounded-2xl font-bold shadow-md sm:shadow-xl shadow-blue-600/25 sm:shadow-blue-600/30 cursor-pointer"
        >
          <Check className="w-4 h-4 mr-1.5" />
          {saving ? "Saving…" : success ? "Saved!" : "Save Live Store Design"}
        </Button>
      </div>
    </div>
  );
}
