"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Tag,
  Grid3X3,
  Type,
  Image as ImageIcon,
  Star,
  MessageCircle,
  Trash2,
  GripVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Section,
  Toggle,
  ShapePicker,
  RadiusPicker,
  CARD_RADIUS_OPTIONS,
  ALL_RADIUS_OPTIONS,
  selectClass,
} from "../_ui/primitives";
import { ImageUploader, SliderBannerUpload } from "../_ui/image-uploader";
import {
  Category,
  Product,
  HeroBanner,
  OfferBanner,
  Testimonial,
} from "../_ui/types";

export interface HomepageTabProps {
  categories: Category[];
  products: Product[];

  // Hero
  heroEnabled: boolean;
  setHeroEnabled: (v: boolean) => void;
  heroType: "CONTENT" | "SLIDER";
  setHeroType: (v: "CONTENT" | "SLIDER") => void;
  heroHeading: string;
  setHeroHeading: (v: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (v: string) => void;
  heroDescription: string;
  setHeroDescription: (v: string) => void;
  heroImageUrl: string;
  heroImagePublicId?: string;
  setHeroImageUrl: (v: string) => void;
  setHeroImagePublicId: (v: string) => void;
  heroCtaText: string;
  setHeroCtaText: (v: string) => void;
  heroButtonLinkType: "SHOP" | "CATEGORY" | "PRODUCT";
  setHeroButtonLinkType: (v: "SHOP" | "CATEGORY" | "PRODUCT") => void;
  heroButtonLinkValue: string;
  setHeroButtonLinkValue: (v: string) => void;
  heroBanners: HeroBanner[];
  addHeroBanner: (result: { url: string; publicId: string }) => void;
  removeHeroBanner: (idx: number) => void;

  // Brand
  brandSectionEnabled: boolean;
  setBrandSectionEnabled: (v: boolean) => void;
  brandShape: string;
  setBrandShape: (v: string) => void;

  // Category
  categorySectionEnabled: boolean;
  setCategorySectionEnabled: (v: boolean) => void;
  categoryShape: string;
  setCategoryShape: (v: string) => void;
  categoryRadius: string;
  setCategoryRadius: (v: string) => void;

  // New Arrivals
  newArrivalEnabled: boolean;
  setNewArrivalEnabled: (v: boolean) => void;

  // Product Card
  productCardRadius: string;
  setProductCardRadius: (v: string) => void;
  showSalePrice: boolean;
  setShowSalePrice: (v: boolean) => void;
  showOriginalPrice: boolean;
  setShowOriginalPrice: (v: boolean) => void;

  // Offer Banners
  offerBanners: OfferBanner[];
  updateOfferBanner: (idx: number, update: Partial<OfferBanner>) => void;

  // Best Seller
  bestSellerEnabled: boolean;
  setBestSellerEnabled: (v: boolean) => void;

  // Testimonials
  testimonialSectionEnabled: boolean;
  setTestimonialSectionEnabled: (v: boolean) => void;
  testimonials: Testimonial[];
  addTestimonial: () => void;
  updateTestimonial: (idx: number, field: keyof Testimonial, value: unknown) => void;
  removeTestimonial: (idx: number) => void;

  // All Products
  allProductsEnabled: boolean;
  setAllProductsEnabled: (v: boolean) => void;

  // WhatsApp
  whatsappEnabled: boolean;
  setWhatsappEnabled: (v: boolean) => void;
}

export function HomepageTab({
  categories,
  products,
  heroEnabled,
  setHeroEnabled,
  heroType,
  setHeroType,
  heroHeading,
  setHeroHeading,
  heroSubtitle,
  setHeroSubtitle,
  heroDescription,
  setHeroDescription,
  heroImageUrl,
  setHeroImageUrl,
  setHeroImagePublicId,
  heroCtaText,
  setHeroCtaText,
  heroButtonLinkType,
  setHeroButtonLinkType,
  heroButtonLinkValue,
  setHeroButtonLinkValue,
  heroBanners,
  addHeroBanner,
  removeHeroBanner,
  brandSectionEnabled,
  setBrandSectionEnabled,
  brandShape,
  setBrandShape,
  categorySectionEnabled,
  setCategorySectionEnabled,
  categoryShape,
  setCategoryShape,
  categoryRadius,
  setCategoryRadius,
  newArrivalEnabled,
  setNewArrivalEnabled,
  productCardRadius,
  setProductCardRadius,
  showSalePrice,
  setShowSalePrice,
  showOriginalPrice,
  setShowOriginalPrice,
  offerBanners,
  updateOfferBanner,
  bestSellerEnabled,
  setBestSellerEnabled,
  testimonialSectionEnabled,
  setTestimonialSectionEnabled,
  testimonials,
  addTestimonial,
  updateTestimonial,
  removeTestimonial,
  allProductsEnabled,
  setAllProductsEnabled,
  whatsappEnabled,
  setWhatsappEnabled,
}: HomepageTabProps) {
  return (
    <div className="space-y-4">
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <Section title="Hero Section" icon={Sparkles}>
        <div className="space-y-5 pt-2">
          <Toggle
            label="Enable Hero Section"
            description="Show or hide the hero banner at the top of your storefront"
            checked={heroEnabled}
            onChange={setHeroEnabled}
          />

          {heroEnabled && (
            <>
              {/* Hero Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Hero Type</label>
                <div className="flex gap-3">
                  {[
                    { value: "CONTENT", label: "Content Hero", desc: "Image + text + button" },
                    { value: "SLIDER", label: "Image Slider", desc: "Up to 3 auto-sliding banners" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeroType(opt.value as "CONTENT" | "SLIDER")}
                      className={cn(
                        "flex-1 p-3 rounded-xl border text-left transition-all",
                        heroType === opt.value
                          ? "border-blue-500 bg-blue-600/10 text-white"
                          : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600"
                      )}
                    >
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENT Hero Fields */}
              {heroType === "CONTENT" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Heading</label>
                      <Input
                        value={heroHeading}
                        onChange={(e) => setHeroHeading(e.target.value)}
                        placeholder="e.g. Shop the Latest Collection"
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Subheading</label>
                      <Input
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        placeholder="e.g. Premium Quality, Unbeatable Prices"
                        maxLength={300}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Short Description</label>
                    <Textarea
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      placeholder="Brief description shown below the subheading"
                      className="min-h-[80px]"
                    />
                  </div>

                  <ImageUploader
                    label="Hero Background Image"
                    url={heroImageUrl}
                    folder="hero"
                    aspectHint="Recommended: 1440×600px, widescreen"
                    onUpload={(r) => {
                      setHeroImageUrl(r.url);
                      setHeroImagePublicId(r.publicId);
                    }}
                    onRemove={() => {
                      setHeroImageUrl("");
                      setHeroImagePublicId("");
                    }}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Button Text</label>
                    <Input
                      value={heroCtaText}
                      onChange={(e) => setHeroCtaText(e.target.value)}
                      placeholder="e.g. Shop Now"
                      maxLength={50}
                    />
                  </div>

                  {/* Button Link Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Button Destination</label>
                    <div className="flex gap-2">
                      {(["SHOP", "CATEGORY", "PRODUCT"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setHeroButtonLinkType(opt);
                            setHeroButtonLinkValue("");
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                            heroButtonLinkType === opt
                              ? "bg-blue-600/20 border-blue-500 text-blue-300"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {opt === "SHOP" ? "Shop Page" : opt === "CATEGORY" ? "Category" : "Product"}
                        </button>
                      ))}
                    </div>

                    {heroButtonLinkType === "CATEGORY" && (
                      <select
                        value={heroButtonLinkValue}
                        onChange={(e) => setHeroButtonLinkValue(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">— Select a category —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {heroButtonLinkType === "PRODUCT" && (
                      <select
                        value={heroButtonLinkValue}
                        onChange={(e) => setHeroButtonLinkValue(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">— Select a product —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* SLIDER Hero Fields */}
              {heroType === "SLIDER" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Upload up to <strong className="text-white">3 banner images</strong>. Banners will auto-slide on
                    the live store.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => {
                      const banner = heroBanners[idx];
                      return (
                        <div key={idx} className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Banner {idx + 1}</label>
                          {banner?.url ? (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-video">
                              <Image
                                src={banner.url}
                                alt={`Banner ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeHeroBanner(idx)}
                                  className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <SliderBannerUpload
                              disabled={heroBanners.length >= 3 && idx >= heroBanners.length}
                              onUpload={addHeroBanner}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      {/* ── Brand Section ────────────────────────────────────────────── */}
      <Section title="Brand Section" icon={Tag} defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Show Brand Section"
            description="Display your brands below the hero"
            checked={brandSectionEnabled}
            onChange={setBrandSectionEnabled}
          />
          {brandSectionEnabled && (
            <ShapePicker
              label="Brand Card Shape"
              value={brandShape}
              onChange={setBrandShape}
              options={[
                { value: "ROUND", label: "Round", icon: "○" },
                { value: "SQUARE", label: "Square", icon: "□" },
                { value: "RECTANGLE", label: "Rectangle", icon: "▭" },
              ]}
            />
          )}
        </div>
      </Section>

      {/* ── Category Section ─────────────────────────────────────────── */}
      <Section title="Category Section" icon={Grid3X3} defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Show Category Section"
            description="Display product categories on the homepage"
            checked={categorySectionEnabled}
            onChange={setCategorySectionEnabled}
          />
          {categorySectionEnabled && (
            <>
              <ShapePicker
                label="Category Card Shape"
                value={categoryShape}
                onChange={setCategoryShape}
                options={[
                  { value: "ROUND", label: "Round", icon: "○" },
                  { value: "SQUARE", label: "Square", icon: "□" },
                  { value: "RECTANGLE", label: "Rectangle", icon: "▭" },
                ]}
              />
              <RadiusPicker
                label="Category Card Border Radius"
                value={categoryRadius}
                onChange={setCategoryRadius}
                options={ALL_RADIUS_OPTIONS}
              />
            </>
          )}
        </div>
      </Section>

      {/* ── New Arrivals ─────────────────────────────────────────────── */}
      <Section title="New Arrivals Section" icon={Sparkles} defaultOpen={false}>
        <div className="pt-2">
          <Toggle
            label="Show New Arrivals"
            description="Display 4 newest products on the homepage"
            checked={newArrivalEnabled}
            onChange={setNewArrivalEnabled}
          />
        </div>
      </Section>

      {/* ── Product Card Settings ─────────────────────────────────────── */}
      <Section title="Product Card Settings" icon={Type} defaultOpen={false}>
        <div className="space-y-5 pt-2">
          <p className="text-xs text-slate-500">
            These settings apply to product cards across New Arrivals, Best Seller, and All Products sections.
          </p>
          <RadiusPicker
            label="Product Card Border Radius"
            value={productCardRadius}
            onChange={setProductCardRadius}
            options={CARD_RADIUS_OPTIONS}
          />
          <div className="space-y-3">
            <Toggle
              label="Show Sale Price"
              description="Display the discounted sale price on product cards"
              checked={showSalePrice}
              onChange={setShowSalePrice}
            />
            <Toggle
              label="Show Original Price"
              description="Display the original strikethrough price when on sale"
              checked={showOriginalPrice}
              onChange={setShowOriginalPrice}
            />
          </div>
        </div>
      </Section>

      {/* ── Offer Banners ─────────────────────────────────────────────── */}
      <Section title="Offer Banners" icon={ImageIcon} defaultOpen={false}>
        <div className="space-y-6 pt-2">
          <p className="text-xs text-slate-500">
            Upload up to 2 promotional banners. Each can link to a category or product.
          </p>
          {[0, 1].map((idx) => {
            const banner = offerBanners[idx] ?? ({} as OfferBanner);
            return (
              <div key={idx} className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <p className="text-xs font-bold text-slate-300">Offer Banner {idx + 1}</p>
                <ImageUploader
                  label="Banner Image"
                  url={banner.url}
                  folder="offer-banners"
                  aspectHint="Recommended: 600×300px"
                  onUpload={(r) => updateOfferBanner(idx, { url: r.url, publicId: r.publicId })}
                  onRemove={() => updateOfferBanner(idx, { url: "", publicId: "" })}
                />
                {banner.url && (
                  <>
                    <RadiusPicker
                      label="Border Radius"
                      value={banner.borderRadius ?? "MD"}
                      onChange={(v) =>
                        updateOfferBanner(idx, { borderRadius: v as "NONE" | "SM" | "MD" | "LG" })
                      }
                      options={CARD_RADIUS_OPTIONS}
                    />
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Link Destination</label>
                      <div className="flex gap-2">
                        {(["CATEGORY", "PRODUCT"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateOfferBanner(idx, { linkType: opt, linkValue: null })}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                              banner.linkType === opt
                                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                            )}
                          >
                            {opt === "CATEGORY" ? "Category" : "Product"}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateOfferBanner(idx, { linkType: null, linkValue: null })}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                            !banner.linkType
                              ? "bg-blue-600/20 border-blue-500 text-blue-300"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          No link
                        </button>
                      </div>
                      {banner.linkType === "CATEGORY" && (
                        <select
                          value={banner.linkValue ?? ""}
                          onChange={(e) => updateOfferBanner(idx, { linkValue: e.target.value })}
                          className={selectClass}
                        >
                          <option value="">— Select category —</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {banner.linkType === "PRODUCT" && (
                        <select
                          value={banner.linkValue ?? ""}
                          onChange={(e) => updateOfferBanner(idx, { linkValue: e.target.value })}
                          className={selectClass}
                        >
                          <option value="">— Select product —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Best Seller ───────────────────────────────────────────────── */}
      <Section title="Best Seller Section" icon={Star} defaultOpen={false}>
        <div className="pt-2">
          <Toggle
            label="Show Best Seller Section"
            description="Display 4 top-selling products on the homepage"
            checked={bestSellerEnabled}
            onChange={setBestSellerEnabled}
          />
        </div>
      </Section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <Section title="Testimonials" icon={Star} defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Show Testimonials Section"
            description="Display customer testimonials (up to 5)"
            checked={testimonialSectionEnabled}
            onChange={setTestimonialSectionEnabled}
          />

          {testimonialSectionEnabled && (
            <>
              <div className="space-y-3">
                {testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                        Testimonial {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Customer Name</label>
                        <Input
                          value={t.name}
                          onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
                          placeholder="e.g. Sarah K."
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Rating (1–5)</label>
                        <div className="flex gap-1 pt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateTestimonial(idx, "rating", star)}
                              className={cn(
                                "text-xl transition-colors",
                                star <= t.rating ? "text-amber-400" : "text-slate-700"
                              )}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Review Text</label>
                      <Textarea
                        value={t.description}
                        onChange={(e) => updateTestimonial(idx, "description", e.target.value)}
                        placeholder="What did they say about your store?"
                        className="min-h-[70px]"
                        maxLength={500}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Card Background Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={t.bgColor || "#1e293b"}
                          onChange={(e) => updateTestimonial(idx, "bgColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs text-slate-400">{t.bgColor || "#1e293b"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {testimonials.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={addTestimonial}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Testimonial ({testimonials.length}/5)
                </Button>
              )}
            </>
          )}
        </div>
      </Section>

      {/* ── All Products ─────────────────────────────────────────────── */}
      <Section title="All Products Section" icon={Grid3X3} defaultOpen={false}>
        <div className="pt-2">
          <Toggle
            label="Show All Products Section"
            description="Display a products grid with View All button linking to the shop"
            checked={allProductsEnabled}
            onChange={setAllProductsEnabled}
          />
        </div>
      </Section>

      {/* ── WhatsApp Floating Button ──────────────────────────────────── */}
      <Section title="WhatsApp Floating Button" icon={MessageCircle} defaultOpen={false}>
        <div className="space-y-3 pt-2">
          <Toggle
            label="Enable WhatsApp Button"
            description="Show a floating WhatsApp button at the bottom-right of the storefront. The number comes from your Store Settings."
            checked={whatsappEnabled}
            onChange={setWhatsappEnabled}
          />
          {whatsappEnabled && (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-400">
              The WhatsApp number is read from{" "}
              <strong className="text-white">Store Settings → Contact → WhatsApp Number</strong>. Make sure it&apos;s
              configured there.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
