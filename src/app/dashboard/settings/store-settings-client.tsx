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
  Unplug,
  Plug,
  ShieldCheck,
  Loader2,
  Lock,
  Key,
} from "lucide-react";
import { getContrastRatio } from "@/lib/store-theme";

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
  const [activeTab, setActiveTab] = useState<"general" | "orders" | "theme" | "domain" | "payments" | "customerAuth">("general");

  // Customer Auth state
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [hasGoogleClientSecret, setHasGoogleClientSecret] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleAuthSaving, setGoogleAuthSaving] = useState(false);
  const [googleAuthSuccess, setGoogleAuthSuccess] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [isEditingSecret, setIsEditingSecret] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  const loadCustomerAuthConfig = async () => {
    try {
      setGoogleAuthLoading(true);
      setGoogleAuthError(null);
      const res = await fetch("/api/stores/current/auth-config");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setGoogleAuthEnabled(json.data.googleEnabled);
        setGoogleClientId(json.data.googleClientId || "");
        setHasGoogleClientSecret(json.data.hasGoogleClientSecret);
        setIsEditingSecret(!json.data.hasGoogleClientSecret);
      }
    } catch {
      setGoogleAuthError("Failed to load customer authentication settings.");
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const handleSaveCustomerAuth = async () => {
    try {
      setGoogleAuthSaving(true);
      setGoogleAuthError(null);
      setGoogleAuthSuccess(null);
      const res = await fetch("/api/stores/current/auth-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleEnabled: googleAuthEnabled,
          googleClientId: googleClientId.trim(),
          ...(googleClientSecret.trim() ? { googleClientSecret: googleClientSecret.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save settings");
      }
      setHasGoogleClientSecret(json.data.hasGoogleClientSecret);
      setGoogleClientSecret("");
      setIsEditingSecret(false);
      setGoogleAuthSuccess("Customer authentication settings saved successfully!");
    } catch (err: unknown) {
      setGoogleAuthError(err instanceof Error ? err.message : "Failed to save customer auth settings.");
    } finally {
      setGoogleAuthSaving(false);
    }
  };

  // Razorpay connection state
  const [rzpStatus, setRzpStatus] = useState<{ connected: boolean; keyId?: string; mode?: string } | null>(null);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [rzpSaving, setRzpSaving] = useState(false);
  const [rzpKeyId, setRzpKeyId] = useState("");
  const [rzpKeySecret, setRzpKeySecret] = useState("");
  const [rzpMode, setRzpMode] = useState<"test" | "live">("test");
  const [rzpShowSecret, setRzpShowSecret] = useState(false);
  const [rzpError, setRzpError] = useState<string | null>(null);
  const [rzpSuccess, setRzpSuccess] = useState<string | null>(null);
  const [rzpDisconnecting, setRzpDisconnecting] = useState(false);
  const [rzpConfirmDisconnect, setRzpConfirmDisconnect] = useState(false);

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
  const [dnsInstructions, setDnsInstructions] = useState<any>(null);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [disconnectingDomain, setDisconnectingDomain] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRouting, setCopiedRouting] = useState(false);

  const handleDomainTabClick = async () => {
    setActiveTab("domain");
    try {
      const res = await fetch("/api/stores/current/domain");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        if (json.data.domain) setCustomDomain(json.data.domain);
        if (json.data.status) setDomainStatus(json.data.status);
        if (json.data.verificationToken) setVerificationToken(json.data.verificationToken);
        if (json.data.dnsInstructions) setDnsInstructions(json.data.dnsInstructions);
      }
    } catch {
      // Keep existing state
    }
  };

  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/${store.slug}` : `/store/${store.slug}`;

  // Fetch Razorpay connection status when Payments tab is opened
  const handlePaymentsTabClick = async () => {
    setActiveTab("payments");
    if (rzpStatus === null) {
      setRzpLoading(true);
      try {
        const res = await fetch("/api/stores/current/payment/razorpay");
        const json = await res.json();
        if (res.ok && json.success) {
          setRzpStatus(json.data);
        }
      } catch {
        // ignore — user will see disconnected state
      } finally {
        setRzpLoading(false);
      }
    }
  };

  // Connect / Update Razorpay (plain function — not a form handler to avoid nested <form>)
  const handleRzpConnect = async () => {
    if (!rzpKeyId.trim() || !rzpKeySecret.trim()) {
      setRzpError("Please enter both Key ID and Key Secret.");
      return;
    }
    setRzpError(null);
    setRzpSuccess(null);
    setRzpSaving(true);
    try {
      const res = await fetch("/api/stores/current/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: rzpKeyId, keySecret: rzpKeySecret, mode: rzpMode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to connect Razorpay");
      }
      setRzpStatus({ connected: true, keyId: rzpKeyId, mode: rzpMode });
      setRzpKeyId("");
      setRzpKeySecret("");
      setRzpSuccess(json.message || "Razorpay connected successfully!");
    } catch (err: unknown) {
      setRzpError(err instanceof Error ? err.message : "Failed to connect Razorpay");
    } finally {
      setRzpSaving(false);
    }
  };

  // Disconnect Razorpay
  const handleRzpDisconnect = async () => {
    setRzpDisconnecting(true);
    setRzpError(null);
    setRzpSuccess(null);
    try {
      const res = await fetch("/api/stores/current/payment/razorpay", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to disconnect Razorpay");
      }
      setRzpStatus({ connected: false });
      setRzpConfirmDisconnect(false);
      setRzpSuccess("Razorpay disconnected. Historical orders remain intact.");
    } catch (err: unknown) {
      setRzpError(err instanceof Error ? err.message : "Failed to disconnect Razorpay");
    } finally {
      setRzpDisconnecting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("File size exceeds 4 MB. Please choose an image smaller than 4 MB.");
      e.target.value = "";
      return;
    }

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

  // Save / Register Custom Domain
  const handleSaveDomain = async () => {
    if (!customDomain.trim()) {
      setError("Please enter a domain name (e.g. store.mybrand.com or mybrand.com).");
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

      setCustomDomain(json.data.domain);
      setVerificationToken(json.data.verificationToken);
      setDomainStatus(json.data.status || "PENDING_VERIFICATION");
      setDnsInstructions(json.instructions || json.data.dnsInstructions);
      setSuccess("Domain registered! Add the DNS records shown below with your registrar and click 'Verify DNS Record'.");
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
        setSuccess("Domain successfully verified! Your storefront is now accessible via your custom domain.");
      } else {
        setDomainStatus("VERIFICATION_FAILED");
        setError(json.error || "DNS verification not detected yet. DNS records may take 10-30 minutes to propagate.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "DNS verification failed.");
    } finally {
      setVerifyingDomain(false);
    }
  };

  // Disconnect Custom Domain
  const handleDisconnectDomain = async () => {
    if (!confirm("Are you sure you want to disconnect this domain? Your storefront, products, and order data will remain untouched.")) {
      return;
    }

    setDisconnectingDomain(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/stores/current/domain", {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to disconnect custom domain.");
      }

      setCustomDomain("");
      setDomainStatus("NOT_CONNECTED");
      setVerificationToken("");
      setDnsInstructions(null);
      setSuccess("Custom domain disconnected successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect custom domain.");
    } finally {
      setDisconnectingDomain(false);
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
          onClick={handleDomainTabClick}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "domain"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          Custom Domain
        </button>

        <button
          type="button"
          onClick={handlePaymentsTabClick}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "payments"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payments
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("customerAuth");
            loadCustomerAuthConfig();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "customerAuth"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Customer Auth
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

                  {/* Contrast Accessibility Warning */}
                  {(() => {
                    const navContrast = getContrastRatio(navbarBg, navbarText);
                    const pageContrast = getContrastRatio(backgroundColor, textColor);
                    const btnContrast = getContrastRatio(buttonBg, buttonText);
                    const hasLow = navContrast < 2.5 || pageContrast < 2.5 || btnContrast < 2.5;
                    if (!hasLow) return null;
                    return (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5">Accessibility Warning: Low Contrast Detected</strong>
                          <span>
                            {pageContrast < 2.5 && "Page background and page text have low contrast. Text may be hard to read or invisible. "}
                            {navContrast < 2.5 && "Navbar background and text have low contrast. "}
                            {btnContrast < 2.5 && "Button background and text have low contrast. "}
                            Ensure text elements contrast with their backgrounds.
                          </span>
                        </div>
                      </div>
                    );
                  })()}

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
                      {logoUrl ? (
                        <div className="relative h-6 max-w-[120px] flex items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-6 w-auto max-w-[120px] object-contain object-left"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: buttonBg, color: buttonText }}
                        >
                          {name[0] || "S"}
                        </div>
                      )}
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
            {/* Active Connected Domain Hero Banner */}
            {(domainStatus === "CONNECTED" || domainStatus === "VERIFIED") && customDomain && (
              <Card className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Custom Domain Active & Verified
                      </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white tracking-tight">
                      https://{customDomain}
                    </p>
                    <p className="text-xs text-slate-400">
                      Your store catalog, cart, checkout, and themes are live on your custom domain.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button type="button" variant="primary" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Visit Storefront
                      </Button>
                    </a>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      isLoading={disconnectingDomain}
                      onClick={handleDisconnectDomain}
                    >
                      <Unplug className="w-4 h-4 mr-1.5" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Domain Configuration Form Card */}
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">Custom Domain Mapping</h2>
                  <p className="text-xs text-slate-400">
                    Connect your own custom root or subdomain (e.g. shop.yourbrand.com or yourbrand.com).
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    domainStatus === "CONNECTED" || domainStatus === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : domainStatus === "PENDING_VERIFICATION"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : domainStatus === "VERIFICATION_FAILED" || domainStatus === "FAILED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Status: {domainStatus.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Custom Domain Hostname</label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. store.yourbrand.com or yourbrand.com"
                    className="flex-1"
                  />
                  <Button type="button" variant="primary" onClick={handleSaveDomain} isLoading={loading}>
                    <Globe className="w-4 h-4 mr-1.5" />
                    {domainStatus === "CONNECTED" || domainStatus === "VERIFIED" ? "Update Domain" : "Register Domain"}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter your domain name without <span className="font-mono text-slate-400">https://</span> or trailing slashes.
                </p>
              </div>

              {/* DNS Instructions Section */}
              {verificationToken && (
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      DNS Configuration Instructions
                    </h4>
                    <span className="text-[11px] text-slate-400">Hostinger, GoDaddy, Namecheap, Cloudflare</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Log in to your domain registrar and create the following DNS records to verify ownership and route traffic:
                  </p>

                  <div className="space-y-3">
                    {/* Record 1: Routing Record */}
                    {customDomain.split(".").length > 2 ? (
                      <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                            Record 1: Traffic Routing (CNAME)
                          </span>
                          <span className="text-[10px] text-slate-400">Points subdomain to platform</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-slate-500 block text-[10px]">TYPE</span>
                            <span className="text-white font-bold">CNAME</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                            <span className="text-white font-bold">{customDomain.split(".")[0]}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">TARGET / VALUE</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-blue-300 font-bold break-all">cname.vercel-dns.com</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("cname.vercel-dns.com");
                                  setCopiedRouting(true);
                                  setTimeout(() => setCopiedRouting(false), 2000);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Copy Value"
                              >
                                {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                            Record 1: Traffic Routing (A Record)
                          </span>
                          <span className="text-[10px] text-slate-400">Points root domain to platform IP</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-slate-500 block text-[10px]">TYPE</span>
                            <span className="text-white font-bold">A</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                            <span className="text-white font-bold">@</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">TARGET / IP</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-blue-300 font-bold break-all">76.76.21.21</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("76.76.21.21");
                                  setCopiedRouting(true);
                                  setTimeout(() => setCopiedRouting(false), 2000);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Copy IP"
                              >
                                {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Record 2: TXT Verification Record */}
                    <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Record 2: Ownership Verification (TXT)
                        </span>
                        <span className="text-[10px] text-slate-400">Proves domain ownership</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">TYPE</span>
                          <span className="text-white font-bold">TXT</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                          <span className="text-white font-bold">@</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">RECORD VALUE</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-emerald-400 font-bold break-all text-[11px]">{verificationToken}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(verificationToken);
                                setCopiedToken(true);
                                setTimeout(() => setCopiedToken(false), 2000);
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                              title="Copy Token"
                            >
                              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    Note: DNS records usually propagate within 5-30 minutes, but can occasionally take up to 24 hours depending on your registrar.
                  </p>

                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={verifyingDomain}
                      onClick={handleVerifyDomain}
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Verify DNS Configuration
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                      isLoading={disconnectingDomain}
                      onClick={handleDisconnectDomain}
                    >
                      <Unplug className="w-4 h-4 mr-1.5" />
                      Disconnect Domain
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 5: PAYMENTS — Merchant Razorpay Integration */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Razorpay Status / Notifications */}
            {rzpSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{rzpSuccess}</span>
              </div>
            )}
            {rzpError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{rzpError}</span>
              </div>
            )}

            {rzpLoading ? (
              <Card className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-3 text-slate-400 text-sm">Loading payment settings...</span>
              </Card>
            ) : (
              <>
                {/* Connection Status Card */}
                {rzpStatus?.connected && (
                  <Card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/20">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">Razorpay Connected</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            rzpStatus.mode === "live"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {rzpStatus.mode ?? "test"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Key ID:{" "}
                          <span className="font-mono text-slate-200">
                            {rzpStatus.keyId
                              ? `${rzpStatus.keyId.slice(0, 12)}${"..".padEnd(8, "●")}`
                              : "—"}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Secret: <span className="font-mono">●●●●●●●●●●●●●●●●</span>
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setRzpConfirmDisconnect(true)}
                        >
                          <Unplug className="w-4 h-4 mr-1.5" />
                          Disconnect
                        </Button>
                      </div>
                    </div>

                    {rzpConfirmDisconnect && (
                      <div className="mt-4 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-3">
                        <p className="text-sm text-rose-300 font-semibold">
                          Disconnect Razorpay?
                        </p>
                        <p className="text-xs text-slate-400">
                          Online payments will be disabled until you reconnect. Existing orders and payment records remain intact.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            isLoading={rzpDisconnecting}
                            onClick={handleRzpDisconnect}
                            className="!bg-rose-600 hover:!bg-rose-700"
                          >
                            Yes, Disconnect
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRzpConfirmDisconnect(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Connect / Update Form */}
                <Card className="space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      {rzpStatus?.connected ? "Update Razorpay Credentials" : "Connect Razorpay"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Connect your Razorpay account so customers can pay online directly into your Razorpay account.
                      Your credentials are encrypted and stored securely — never visible to anyone.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Mode selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Account Mode</label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rzpMode"
                            value="test"
                            checked={rzpMode === "test"}
                            onChange={() => setRzpMode("test")}
                            className="accent-blue-500"
                          />
                          <span className="text-sm text-slate-300">Test Mode</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rzpMode"
                            value="live"
                            checked={rzpMode === "live"}
                            onChange={() => setRzpMode("live")}
                            className="accent-emerald-500"
                          />
                          <span className="text-sm text-slate-300">Live Mode</span>
                        </label>
                      </div>
                      {rzpMode === "live" && (
                        <p className="text-[11px] text-amber-400">⚠ Live mode will charge real money. Ensure your credentials are from a verified Razorpay account.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Key ID *</label>
                      <Input
                        required
                        value={rzpKeyId}
                        onChange={(e) => setRzpKeyId(e.target.value)}
                        placeholder={rzpMode === "live" ? "rzp_live_..." : "rzp_test_..."}
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Key Secret *</label>
                      <div className="relative">
                        <Input
                          required
                          type={rzpShowSecret ? "text" : "password"}
                          value={rzpKeySecret}
                          onChange={(e) => setRzpKeySecret(e.target.value)}
                          placeholder="Enter your Razorpay Key Secret"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setRzpShowSecret(!rzpShowSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Your secret is encrypted with AES-256-GCM before storage. It is never visible or logged after saving.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        isLoading={rzpSaving}
                        onClick={handleRzpConnect}
                      >
                        <Plug className="w-4 h-4 mr-1.5" />
                        {rzpStatus?.connected ? "Update Credentials" : "Connect Razorpay"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Help Card */}
                <Card className="bg-slate-900/60 border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300">Need help?</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://razorpay.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="button" variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Create Razorpay Account
                      </Button>
                    </a>
                    <a
                      href="https://dashboard.razorpay.com/app/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="button" variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Get API Keys
                      </Button>
                    </a>
                  </div>
                  <p className="text-xs text-slate-500">
                    Find your API keys at Dashboard → Settings → API Keys in your Razorpay account.
                  </p>
                </Card>
              </>
            )}
          </div>
        )}

        {/* TAB 6: CUSTOMER AUTHENTICATION (GOOGLE OAUTH) */}
        {activeTab === "customerAuth" && (
          <div className="space-y-6">
            {googleAuthError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {googleAuthError}
              </div>
            )}

            {googleAuthSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                {googleAuthSuccess}
              </div>
            )}

            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Google Customer Authentication</h2>
                    <p className="text-xs text-slate-400">
                      Allow your store customers to sign in with their Google accounts using your store credentials.
                    </p>
                  </div>
                </div>
              </div>

              {googleAuthLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading authentication settings…</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Enable Google Login</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Displays &ldquo;Continue with Google&rdquo; on your storefront customer login page.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={googleAuthEnabled}
                        onChange={(e) => setGoogleAuthEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Client ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-slate-400" />
                      Google Client ID
                    </label>
                    <Input
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      placeholder="e.g. 1234567890-abc123xyz.apps.googleusercontent.com"
                    />
                    <p className="text-[11px] text-slate-500">
                      Obtain this from your Google Cloud Console OAuth 2.0 Client credentials.
                    </p>
                  </div>

                  {/* Client Secret */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-slate-400" />
                      Google Client Secret
                    </label>
                    {hasGoogleClientSecret && !isEditingSecret ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-sm text-slate-400 tracking-wider">
                          ••••••••••••••••••••••••••••••••
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingSecret(true);
                            setGoogleClientSecret("");
                          }}
                        >
                          Change Secret
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          value={googleClientSecret}
                          onChange={(e) => setGoogleClientSecret(e.target.value)}
                          placeholder="Enter your Google Client Secret"
                        />
                        {hasGoogleClientSecret && (
                          <button
                            type="button"
                            onClick={() => setIsEditingSecret(false)}
                            className="text-xs text-slate-400 hover:text-slate-200 underline"
                          >
                            Cancel and keep existing secret
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Encrypted server-side using AES-256-GCM. Never exposed to browser or storefront.
                    </p>
                  </div>

                  {/* Authorized Redirect URI */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Authorized Redirect URI (Copy to Google Cloud Console)
                    </label>
                    {(() => {
                      const origin =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                      const defaultCallback = `${origin}/api/stores/${store.slug}/auth/google/callback`;
                      return (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={defaultCallback}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 select-all"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(defaultCallback);
                              setCopiedCallback(true);
                              setTimeout(() => setCopiedCallback(false), 2000);
                            }}
                          >
                            {copiedCallback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copiedCallback ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      );
                    })()}
                    <p className="text-[11px] text-slate-500">
                      In Google Cloud Console under Credentials &gt; OAuth 2.0 Client IDs, add this exact URL into &ldquo;Authorized redirect URIs&rdquo;.
                    </p>
                  </div>

                  {/* Save Button for Customer Auth */}
                  <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      isLoading={googleAuthSaving}
                      onClick={handleSaveCustomerAuth}
                    >
                      Save Authentication Settings
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Email/Password Info Card */}
            <Card className="bg-slate-900/60 border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-slate-200">Email &amp; Username Authentication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Email and Username + Password login is always active for your storefront customers with built-in secure scrypt hashing, account registration, and password recovery.
              </p>
            </Card>
          </div>
        )}

        {/* Global Save Button (for General, Order Methods and Theme only) */}
        {activeTab !== "domain" && activeTab !== "payments" && activeTab !== "customerAuth" && (
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
