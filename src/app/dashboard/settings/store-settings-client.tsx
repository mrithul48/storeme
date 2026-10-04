"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Palette, Upload, Check, AlertCircle, ExternalLink, Copy } from "lucide-react";

interface StoreSettingsClientProps {
  store: any;
}

const colorPresets = [
  { name: "Ocean Blue", value: "#3b82f6" },
  { name: "Emerald Luxe", value: "#10b981" },
  { name: "Royal Violet", value: "#8b5cf6" },
  { name: "Rose Crimson", value: "#f43f5e" },
  { name: "Amber Sunset", value: "#f97316" },
  { name: "Midnight Teal", value: "#06b6d4" },
];

export function StoreSettingsClient({ store }: StoreSettingsClientProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // General settings
  const [name, setName] = useState(store.name || "");
  const [businessType, setBusinessType] = useState(store.company?.businessType || "RETAIL");
  const [description, setDescription] = useState(store.company?.description || "");
  const [email, setEmail] = useState(store.company?.email || "");
  const [phone, setPhone] = useState(store.company?.phone || "");
  const [whatsapp, setWhatsapp] = useState(store.company?.whatsapp || "");
  const [address, setAddress] = useState(store.company?.address || "");
  const [logoUrl, setLogoUrl] = useState(store.company?.logoUrl || "");

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState(store.theme?.primaryColor || "#3b82f6");
  const [buttonShape, setButtonShape] = useState(store.theme?.buttonShape || "MEDIUM_ROUNDED");

  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/${store.slug}` : `/store/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "logos");

      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (res.ok && json.success) {
        setLogoUrl(json.url);
      }
    } catch (err) {
      console.error("Logo upload error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Update store and company details
      const resStore = await fetch("/api/stores/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company: {
            businessType,
            description,
            email,
            phone,
            whatsapp,
            address,
            logoUrl,
          },
        }),
      });

      // 2. Update theme details
      const resTheme = await fetch("/api/stores/current/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          buttonShape,
        }),
      });

      if (!resStore.ok || !resTheme.ok) {
        throw new Error("Failed to save some settings.");
      }

      setSuccess("Store settings and theme updated successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update store settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shareable Storefront Link Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/20">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Your Public Store URL
          </span>
          <p className="font-mono text-sm text-slate-200 truncate">{storeUrl}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Link href={`/store/${store.slug}`} target="_blank">
            <Button type="button" variant="primary" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit Store
            </Button>
          </Link>
        </div>
      </Card>

      {/* Theme & Visual Appearance */}
      <Card className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-white">Theme & Brand Palette</h2>
            <p className="text-xs text-slate-400">
              Pick the primary brand accent color that powers your storefront buttons and banners.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Preset Palettes</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {colorPresets.map((preset) => (
              <button
                type="button"
                key={preset.value}
                onClick={() => setPrimaryColor(preset.value)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  primaryColor === preset.value
                    ? "border-white bg-slate-800 ring-2 ring-white/20"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: preset.value }}
                />
                <span className="text-[11px] font-medium text-slate-300">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="space-y-1 flex-1 max-w-xs">
            <label className="text-xs font-semibold text-slate-300">Custom Hex Code</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
                className="font-mono uppercase text-xs"
              />
            </div>
          </div>

          <div className="space-y-1 flex-1 max-w-xs">
            <label className="text-xs font-semibold text-slate-300">Button Corner Radius</label>
            <select
              value={buttonShape}
              onChange={(e) => setButtonShape(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SQUARE">Square (Sharp)</option>
              <option value="MEDIUM_ROUNDED">Rounded (Modern)</option>
              <option value="FULLY_ROUNDED">Fully Rounded (Pill)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* General Store Details */}
      <Card className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Store className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-white">Business Details</h2>
            <p className="text-xs text-slate-400">
              Information displayed to customers on your storefront and order receipts.
            </p>
          </div>
        </div>

        {/* Logo preview & upload */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {logoUrl ? (
              <Image src={logoUrl} alt="Store Logo" fill className="object-cover" />
            ) : (
              <Store className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Store Logo</label>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <span className="text-[11px] text-slate-500 block">Square PNG/JPG recommended</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Store Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Sneaker Studio"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Category</label>
            <Input
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="e.g. Fashion, Electronics, Gourmet Food"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">About the Store</label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell your customers about your brand story, mission, and products..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Support Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="support@yourstore.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Physical Store Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop No., Street, City, State, PIN"
          />
        </div>
      </Card>

      {/* Save Action */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" size="lg" isLoading={loading}>
          Save All Changes
        </Button>
      </div>
    </form>
  );
}
