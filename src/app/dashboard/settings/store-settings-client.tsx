"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Palette,
  Upload,
  Check,
  AlertCircle,
  ExternalLink,
  Copy,
  CreditCard,
  Banknote,
  MessageCircle,
  Globe,
  RefreshCw,
  Sliders,
  Type,
  Eye,
} from "lucide-react";

interface StoreSettingsClientProps {
  store: any;
}

const colorPresets = [
  { name: "Ocean Blue", primary: "#3b82f6", buttonBg: "#3b82f6", navbarBg: "#0f172a" },
  { name: "Emerald Luxe", primary: "#10b981", buttonBg: "#10b981", navbarBg: "#064e3b" },
  { name: "Royal Violet", primary: "#8b5cf6", buttonBg: "#8b5cf6", navbarBg: "#2e1065" },
  { name: "Rose Crimson", primary: "#f43f5e", buttonBg: "#f43f5e", navbarBg: "#4c0519" },
  { name: "Amber Sunset", primary: "#f97316", buttonBg: "#f97316", navbarBg: "#431407" },
  { name: "Midnight Teal", primary: "#06b6d4", buttonBg: "#06b6d4", navbarBg: "#083344" },
];

const supportedFonts = [
  { id: "Inter", name: "Inter (Clean & Modern)" },
  { id: "Poppins", name: "Poppins (Geometric & Trendy)" },
  { id: "Roboto", name: "Roboto (Neutral & Legible)" },
  { id: "Playfair Display", name: "Playfair Display (Editorial & Luxury)" },
  { id: "Montserrat", name: "Montserrat (Bold & Contemporary)" },
];

export function StoreSettingsClient({ store }: StoreSettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "orders" | "theme" | "domain">("general");

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

  // Order Methods
  const [ordersEnabled, setOrdersEnabled] = useState(store.settings?.ordersEnabled !== false);
  const [codEnabled, setCodEnabled] = useState(store.settings?.codEnabled !== false);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(store.settings?.onlinePaymentEnabled !== false);
  const [whatsappOrderEnabled, setWhatsappOrderEnabled] = useState(Boolean(store.settings?.whatsappOrderEnabled));

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState(store.theme?.primaryColor || "#3b82f6");
  const [navbarBg, setNavbarBg] = useState(store.theme?.navbarBg || "#ffffff");
  const [navbarText, setNavbarText] = useState(store.theme?.navbarText || "#111827");
  const [buttonBg, setButtonBg] = useState(store.theme?.buttonBg || "#3b82f6");
  const [buttonText, setButtonText] = useState(store.theme?.buttonText || "#ffffff");
  const [backgroundColor, setBackgroundColor] = useState(store.theme?.backgroundColor || "#ffffff");
  const [textColor, setTextColor] = useState(store.theme?.textColor || "#111827");
  const [h1Color, setH1Color] = useState(store.theme?.h1Color || "#111827");
  const [h2Color, setH2Color] = useState(store.theme?.h2Color || "#1f2937");
  const [paragraphColor, setParagraphColor] = useState(store.theme?.paragraphColor || "#374151");
  const [buttonShape, setButtonShape] = useState(store.theme?.buttonShape || "MEDIUM_ROUNDED");
  const [primaryFont, setPrimaryFont] = useState(store.theme?.primaryFont || "Inter");

  // Custom Domain settings
  const [customDomain, setCustomDomain] = useState(store.customDomain || "");
  const [domainStatus, setDomainStatus] = useState(store.domainStatus || "NOT_CONNECTED");
  const [verificationToken, setVerificationToken] = useState(store.domainVerificationToken || "");
  const [verifyingDomain, setVerifyingDomain] = useState(false);

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

    // Validate at least one order method is enabled if orders are accepted
    if (ordersEnabled && !codEnabled && !onlinePaymentEnabled && !whatsappOrderEnabled) {
      setError("Please enable at least one order method (Cash on Delivery, Online Payment, or WhatsApp) to accept orders.");
      setLoading(false);
      return;
    }

    try {
      // 1. Update store, company and order method settings
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
          settings: {
            ordersEnabled,
            codEnabled,
            onlinePaymentEnabled,
            whatsappOrderEnabled,
          },
        }),
      });

      // 2. Update extended theme details
      const resTheme = await fetch("/api/stores/current/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          navbarBg,
          navbarText,
          buttonBg,
          buttonText,
          backgroundColor,
          textColor,
          h1Color,
          h2Color,
          paragraphColor,
          buttonShape,
          primaryFont,
        }),
      });

      if (!resStore.ok || !resTheme.ok) {
        throw new Error("Failed to save settings. Please verify all fields.");
      }

      setSuccess("Settings and theme saved successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update store settings.");
    } finally {
      setLoading(false);
    }
  };

  // Save Custom Domain
  const handleSaveDomain = async () => {
    if (!customDomain) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/stores/current/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: customDomain }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to register custom domain.");
      }

      setVerificationToken(json.data.domainVerificationToken);
      setDomainStatus(json.data.domainStatus);
      setSuccess("Domain registered! Add the DNS TXT record below and click 'Verify DNS Record'.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save custom domain.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Custom Domain DNS
  const handleVerifyDomain = async () => {
    setVerifyingDomain(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/stores/current/domain/verify", {
        method: "POST",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDomainStatus("CONNECTED");
        setSuccess("Domain successfully verified and connected!");
      } else {
        setDomainStatus("VERIFICATION_FAILED");
        setError(json.error || "DNS verification not detected yet. Please ensure your TXT record is active.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "DNS verification failed.");
    } finally {
      setVerifyingDomain(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "general"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Store className="w-4 h-4" />
          General & Brand
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "orders"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Order Methods
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "theme"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          Theme & Styling
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("domain")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "domain"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          Custom Domain
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: GENERAL & BRAND */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Business Details</h2>
                <p className="text-xs text-slate-400">
                  Basic identifying details displayed across your storefront and order receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Store Name *</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lumina Apparel"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Business Category</label>
                  <Input
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Fashion & Lifestyle"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Store Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what makes your products and store special..."
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-300">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {logoUrl ? (
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      Upload New Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">PNG, JPG or SVG up to 2MB</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Contact & Support Details</h2>
                <p className="text-xs text-slate-400">
                  Customers use these details to contact your store regarding inquiries and orders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Support Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@yourstore.com"
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
                <label className="text-xs font-semibold text-slate-300">Physical Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 74 Fashion Blvd, Indiranagar, Bengaluru, KA 560038"
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: ORDER METHODS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Checkout & Order Channels</h2>
                  <p className="text-xs text-slate-400">
                    Enable or disable the ordering methods available to customers on your storefront.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-300">Store Ordering:</span>
                  <input
                    type="checkbox"
                    checked={ordersEnabled}
                    onChange={(e) => setOrdersEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-xs font-bold ${ordersEnabled ? "text-emerald-400" : "text-rose-400"}`}>
                    {ordersEnabled ? "OPEN" : "PAUSED"}
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                {/* Method 1: COD */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-slate-400">
                        Allow customers to place orders online and pay cash directly upon delivery.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                  />
                </div>

                {/* Method 2: Online Payment */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Online Payment (Razorpay)</h4>
                      <p className="text-xs text-slate-400">
                        Accept instant UPI, credit/debit cards, and NetBanking payments securely.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlinePaymentEnabled}
                    onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                  />
                </div>

                {/* Method 3: WhatsApp Ordering */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">WhatsApp Direct Order</h4>
                      <p className="text-xs text-slate-400">
                        Saves order in database and opens WhatsApp with a pre-filled summary to complete with customer.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappOrderEnabled}
                    onChange={(e) => setWhatsappOrderEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: THEME & STYLING WITH LIVE PREVIEW */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white">Color Presets</h2>
                    <p className="text-xs text-slate-400">
                      Choose a harmonious designer palette or customize every element individually.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {colorPresets.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setButtonBg(preset.buttonBg);
                          setNavbarBg(preset.navbarBg);
                          setNavbarText("#ffffff");
                        }}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 flex items-center gap-2.5 transition-all text-left"
                      >
                        <div
                          className="w-5 h-5 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Typography Selector */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-blue-400" />
                      Storefront Font Style
                    </label>
                    <select
                      value={primaryFont}
                      onChange={(e) => setPrimaryFont(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {supportedFonts.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Button Shape */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Button Shape</label>
                    <select
                      value={buttonShape}
                      onChange={(e) => setButtonShape(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SQUARE">Sharp Corners (Square)</option>
                      <option value="MEDIUM_ROUNDED">Rounded Corners (Standard)</option>
                      <option value="FULLY_ROUNDED">Pill Shaped (Fully Rounded)</option>
                    </select>
                  </div>
                </Card>

                {/* Detailed Color Pickers */}
                <Card className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white">Element Colors</h2>
                    <p className="text-xs text-slate-400">
                      Exact HEX colors for specific storefront sections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Navbar Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={navbarBg}
                          onChange={(e) => setNavbarBg(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={navbarBg} onChange={(e) => setNavbarBg(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Navbar Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={navbarText}
                          onChange={(e) => setNavbarText(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={navbarText} onChange={(e) => setNavbarText(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Button Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={buttonBg}
                          onChange={(e) => setButtonBg(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Button Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={buttonText}
                          onChange={(e) => setButtonText(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Page Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Heading 1 (H1) Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={h1Color}
                          onChange={(e) => setH1Color(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={h1Color} onChange={(e) => setH1Color(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Heading 2 (H2) Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={h2Color}
                          onChange={(e) => setH2Color(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={h2Color} onChange={(e) => setH2Color(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Paragraph Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={paragraphColor}
                          onChange={(e) => setParagraphColor(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input value={paragraphColor} onChange={(e) => setParagraphColor(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Eye className="w-4 h-4" />
                  Live Theme Preview
                </div>

                <div
                  className="rounded-2xl border border-slate-700 shadow-2xl overflow-hidden transition-all sticky top-24"
                  style={{
                    backgroundColor,
                    fontFamily: primaryFont,
                  }}
                >
                  {/* Mock Navbar */}
                  <div
                    className="p-4 flex items-center justify-between border-b border-black/10 transition-colors"
                    style={{ backgroundColor: navbarBg, color: navbarText }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: buttonBg, color: buttonText }}
                      >
                        {name[0] || "S"}
                      </div>
                      <span className="font-bold text-sm truncate">{name || "Store Name"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-90">
                      <span>Products</span>
                      <span>Cart (2)</span>
                    </div>
                  </div>

                  {/* Mock Hero Section */}
                  <div className="p-6 space-y-4">
                    <h1
                      className="text-xl font-extrabold tracking-tight transition-colors"
                      style={{ color: h1Color }}
                    >
                      New Summer Collection
                    </h1>
                    <h2
                      className="text-sm font-semibold transition-colors"
                      style={{ color: h2Color }}
                    >
                      Handcrafted contemporary essentials
                    </h2>
                    <p
                      className="text-xs leading-relaxed transition-colors"
                      style={{ color: paragraphColor }}
                    >
                      Engineered for timeless aesthetic, sustainable materials, and ultimate everyday comfort.
                    </p>

                    <div className="pt-2">
                      <button
                        type="button"
                        className={`px-5 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                          buttonShape === "FULLY_ROUNDED"
                            ? "rounded-full"
                            : buttonShape === "SQUARE"
                            ? "rounded-none"
                            : "rounded-xl"
                        }`}
                        style={{
                          backgroundColor: buttonBg,
                          color: buttonText,
                        }}
                      >
                        Shop Now • ₹1,299
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM DOMAIN */}
        {activeTab === "domain" && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Custom Domain Mapping</h2>
                  <p className="text-xs text-slate-400">
                    Connect your own custom root or subdomain (e.g. shop.yourbrand.com).
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    domainStatus === "CONNECTED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : domainStatus === "PENDING_VERIFICATION"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : domainStatus === "VERIFICATION_FAILED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Status: {domainStatus.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Custom Domain Hostname</label>
                <div className="flex gap-2">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. store.lumina.style"
                  />
                  <Button type="button" variant="primary" onClick={handleSaveDomain} isLoading={loading}>
                    Register Domain
                  </Button>
                </div>
              </div>

              {verificationToken && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    DNS Verification Instructions
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Add the following TXT record with your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.) to prove ownership:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">RECORD TYPE</span>
                      <span className="text-white font-bold">TXT</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                      <span className="text-white font-bold">@ (or subdomain)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">RECORD VALUE</span>
                      <span className="text-emerald-400 font-bold break-all">{verificationToken}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={verifyingDomain}
                      onClick={handleVerifyDomain}
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Verify DNS Record
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Global Save Button (for General, Order Methods and Theme) */}
        {activeTab !== "domain" && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="submit" variant="primary" size="lg" isLoading={loading}>
              Save All Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
