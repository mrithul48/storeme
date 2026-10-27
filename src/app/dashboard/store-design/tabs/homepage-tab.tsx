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
  AccordionGroup,
  Toggle,
  ShapePicker,
  RadiusPicker,
  CustomDropdown,
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

  // Hero (Image Slider only)
  heroEnabled: boolean;
  setHeroEnabled: (v: boolean) => void;
  heroBanners: HeroBanner[];
  addHeroBanner: (result: { url: string; publicId: string }) => void;
  updateHeroBanner: (idx: number, update: Partial<HeroBanner>) => void;
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
  heroBanners,
  addHeroBanner,
  updateHeroBanner,
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
      <AccordionGroup>
        {/* ── Hero Section (Image Slider) ────────────────────────────── */}
        <Section title="Hero Section (Image Slider)" icon={Sparkles}>
        <div className="space-y-5 pt-2">
          <Toggle
            label="Enable Hero Section"
            description="Show or hide the hero image slider at the top of your storefront"
            checked={heroEnabled}
            onChange={setHeroEnabled}
          />

          {heroEnabled && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B]">
                Upload up to <strong className="text-[#0F172A]">3 banner slides</strong>. Banners will auto-slide on the live store. You can upload both a <strong className="text-[#0F172A]">Desktop Banner</strong> and a separate <strong className="text-[#0F172A]">Mobile Banner</strong> for each slide.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const banner = heroBanners[idx];
                  return (
                    <div
                      key={idx}
                      className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <label className="text-xs font-bold text-[#0F172A]">Slide {idx + 1}</label>
                        {banner?.url && (
                          <button
                            type="button"
                            onClick={() => removeHeroBanner(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Slide
                          </button>
                        )}
                      </div>

                      {banner?.url ? (
                        <div className="space-y-3">
                          {/* Desktop Banner Image */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-[#0F172A]">Desktop Banner *</label>
                              <span className="text-[10px] text-[#64748B]">Desktop & Tablet</span>
                            </div>
                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-xs">
                              <Image
                                src={banner.url}
                                alt={`Slide ${idx + 1} Desktop`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer px-2.5 py-1 bg-[#2563EB] text-white text-[11px] rounded-lg flex items-center gap-1 shadow-xs">
                                  Replace
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      formData.append("folder", "hero-slider");
                                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                                      const json = await res.json();
                                      if (res.ok && json.success) {
                                        updateHeroBanner(idx, { url: json.url, publicId: json.publicId });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Banner Image */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-[#0F172A]">Mobile Banner (Optional)</label>
                              <span className="text-[10px] text-[#64748B]">Phone view</span>
                            </div>
                            {banner.mobileUrl ? (
                              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] shadow-xs">
                                <Image
                                  src={banner.mobileUrl}
                                  alt={`Slide ${idx + 1} Mobile`}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="cursor-pointer px-2.5 py-1 bg-blue-600 text-white text-[11px] rounded-lg flex items-center gap-1">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        formData.append("folder", "hero-slider-mobile");
                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                        const json = await res.json();
                                        if (res.ok && json.success) {
                                          updateHeroBanner(idx, { mobileUrl: json.url, mobilePublicId: json.publicId });
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => updateHeroBanner(idx, { mobileUrl: null, mobilePublicId: null })}
                                    className="px-2.5 py-1 bg-red-600 text-white text-[11px] rounded-lg flex items-center gap-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:border-[#2563EB]/50 transition-all cursor-pointer h-24 p-2 text-center">
                                <span className="text-[11px] text-[#64748B] font-medium">Upload Mobile Banner</span>
                                <span className="text-[10px] text-slate-400">Optimized for phones (e.g. 800×1000)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    formData.append("folder", "hero-slider-mobile");
                                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                                    const json = await res.json();
                                    if (res.ok && json.success) {
                                      updateHeroBanner(idx, { mobileUrl: json.url, mobilePublicId: json.publicId });
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-3">
                          <SliderBannerUpload
                            disabled={heroBanners.length >= 3 && idx >= heroBanners.length}
                            onUpload={addHeroBanner}
                          />
                          <p className="text-[10px] text-slate-500 text-center">Upload desktop banner to create Slide {idx + 1}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
          <p className="text-xs text-[#64748B]">
            Upload up to 2 promotional banners. Each can link to a category or product.
          </p>
          {[0, 1].map((idx) => {
            const banner = offerBanners[idx] ?? ({} as OfferBanner);
            return (
              <div key={idx} className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <p className="text-sm font-bold text-[#0F172A]">Offer Banner {idx + 1}</p>
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
                      <label className="text-xs font-semibold text-[#0F172A]">Link Destination</label>
                      <div className="flex gap-2 flex-wrap">
                        {(["CATEGORY", "PRODUCT"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateOfferBanner(idx, { linkType: opt, linkValue: null })}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer",
                              banner.linkType === opt
                                ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                                : "bg-white border-slate-200 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 hover:border-slate-300"
                            )}
                          >
                            {opt === "CATEGORY" ? "Category" : "Product"}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateOfferBanner(idx, { linkType: null, linkValue: null })}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer",
                            !banner.linkType
                              ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                              : "bg-white border-slate-200 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 hover:border-slate-300"
                          )}
                        >
                          No link
                        </button>
                      </div>
                      {banner.linkType === "CATEGORY" && (
                        <div className="pt-1">
                          <label className="text-[11px] font-semibold text-[#64748B] mb-1.5 block">
                            Select Category
                          </label>
                          <CustomDropdown
                            placeholder="Choose category…"
                            options={categories}
                            value={banner.linkValue ?? null}
                            onChange={(val) => updateOfferBanner(idx, { linkValue: val })}
                            icon={Grid3X3}
                            emptyText="No categories available"
                          />
                        </div>
                      )}
                      {banner.linkType === "PRODUCT" && (
                        <div className="pt-1">
                          <label className="text-[11px] font-semibold text-[#64748B] mb-1.5 block">
                            Select Product
                          </label>
                          <CustomDropdown
                            placeholder="Choose product…"
                            options={products}
                            value={banner.linkValue ?? null}
                            onChange={(val) => updateOfferBanner(idx, { linkValue: val })}
                            icon={Tag}
                            emptyText="No products available"
                          />
                        </div>
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
                  <div key={t.id} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                        Testimonial {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(idx)}
                        className="p-1 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#0F172A]">Customer Name</label>
                        <Input
                          value={t.name}
                          onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
                          placeholder="e.g. Sarah K."
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#0F172A]">Rating (1–5)</label>
                        <div className="flex gap-1 pt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateTestimonial(idx, "rating", star)}
                              className={cn(
                                "text-xl transition-colors cursor-pointer",
                                star <= t.rating ? "text-amber-400" : "text-slate-200 hover:text-amber-300"
                              )}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#0F172A]">Review Text</label>
                      <Textarea
                        value={t.description}
                        onChange={(e) => updateTestimonial(idx, "description", e.target.value)}
                        placeholder="What did they say about your store?"
                        className="min-h-[70px]"
                        maxLength={500}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#0F172A]">Card Background Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={t.bgColor || "#ffffff"}
                          onChange={(e) => updateTestimonial(idx, "bgColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-200"
                        />
                        <span className="text-xs text-[#64748B] font-mono">{t.bgColor || "#ffffff"}</span>
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
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              The WhatsApp number is read from{" "}
              <strong className="text-emerald-950">Store Settings → Contact → WhatsApp Number</strong>. Make sure it&apos;s
              configured there.
            </div>
          )}
        </div>
      </Section>
      </AccordionGroup>
    </div>
  );
}
