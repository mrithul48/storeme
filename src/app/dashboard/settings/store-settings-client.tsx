"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";

import {
  SettingsTab,
  StockManagementType,
  ColorWiseStockType,
  StoreSettingsClientProps,
  RazorpayStatus,
} from "./types";
import { StoreUrlBanner } from "./components/store-url-banner";
import { SettingsTabsNav } from "./components/settings-tabs-nav";
import { StockConfirmModal } from "./components/stock-confirm-modal";
import { GeneralTab } from "./tabs/general-tab";
import { ProductsTab } from "./tabs/products-tab";
import { OrdersTab } from "./tabs/orders-tab";
import { ThemeTab } from "./tabs/theme-tab";
import { DomainTab } from "./tabs/domain-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { CustomerAuthTab } from "./tabs/customer-auth-tab";

export function StoreSettingsClient({ store }: StoreSettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Stock Management state
  const [savedStockType, setSavedStockType] = useState<StockManagementType>(
    store.settings?.stockManagementType || null
  );
  const [savedColorWiseType, setSavedColorWiseType] = useState<ColorWiseStockType>(
    store.settings?.colorWiseStockType || "AVAILABILITY"
  );

  const [stockManagementType, setStockManagementType] = useState<StockManagementType>(
    store.settings?.stockManagementType || null
  );
  const [colorWiseStockType, setColorWiseStockType] = useState<ColorWiseStockType>(
    store.settings?.colorWiseStockType || "AVAILABILITY"
  );
  const [savingStockSettings, setSavingStockSettings] = useState(false);
  const [stockSuccess, setStockSuccess] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  // Sync saved stock settings if store prop updates
  useEffect(() => {
    if (store?.settings?.stockManagementType !== undefined) {
      setSavedStockType(store.settings?.stockManagementType || null);
    }
    if (store?.settings?.colorWiseStockType) {
      setSavedColorWiseType(store.settings.colorWiseStockType);
    }
  }, [store?.settings?.stockManagementType, store?.settings?.colorWiseStockType]);

  // Stock Type Change Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalForSave, setConfirmModalForSave] = useState(false);
  const [pendingStockType, setPendingStockType] = useState<StockManagementType>(null);
  const [pendingColorWiseType, setPendingColorWiseType] = useState<ColorWiseStockType | null>(null);

  const handleRequestStockTypeChange = (newType: "AVAILABILITY" | "QUANTITY" | "COLOR_WISE") => {
    // 1. If user is selecting for the first time, do not show confirmation message
    if (!savedStockType) {
      setStockManagementType(newType);
      return;
    }

    // 2. If clicking what is already active on screen, do nothing
    if (newType === stockManagementType) return;

    // 3. If clicking back to what is ALREADY saved in store settings, switch directly without modal
    const isAlreadySaved =
      newType === savedStockType &&
      (newType !== "COLOR_WISE" || colorWiseStockType === savedColorWiseType);

    if (isAlreadySaved) {
      setStockManagementType(newType);
      if (newType === "COLOR_WISE") {
        setColorWiseStockType(savedColorWiseType);
      }
      return;
    }

    // 4. Truly switching away from saved configuration -> prompt confirmation message
    setPendingStockType(newType);
    setPendingColorWiseType(newType === "COLOR_WISE" ? colorWiseStockType : null);
    setConfirmModalForSave(false);
    setShowConfirmModal(true);
  };

  const handleRequestColorWiseTypeChange = (newSubType: "AVAILABILITY" | "QUANTITY") => {
    // 1. If user is selecting for the first time, do not show confirmation message
    if (!savedStockType) {
      setColorWiseStockType(newSubType);
      return;
    }

    if (newSubType === colorWiseStockType) return;

    // 2. If COLOR_WISE is already saved and switching back to saved sub-type, switch directly without modal
    if (savedStockType === "COLOR_WISE" && newSubType === savedColorWiseType) {
      setColorWiseStockType(newSubType);
      return;
    }

    // 3. If store already has COLOR_WISE configured and sub-type changes -> prompt confirmation
    if (savedStockType === "COLOR_WISE") {
      setPendingStockType("COLOR_WISE");
      setPendingColorWiseType(newSubType);
      setConfirmModalForSave(false);
      setShowConfirmModal(true);
    } else {
      setColorWiseStockType(newSubType);
    }
  };

  const executeSaveStock = async (
    targetType: "AVAILABILITY" | "QUANTITY" | "COLOR_WISE",
    targetColorType: "AVAILABILITY" | "QUANTITY" | null
  ) => {
    setSavingStockSettings(true);
    setStockError(null);
    setStockSuccess(null);
    const isChangingType =
      savedStockType !== null &&
      (targetType !== savedStockType ||
        (targetType === "COLOR_WISE" && targetColorType !== savedColorWiseType));

    try {
      const res = await fetch("/api/stores/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            stockManagementType: targetType,
            colorWiseStockType: targetType === "COLOR_WISE" ? targetColorType : null,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update stock management settings.");
      }
      setSavedStockType(targetType);
      if (targetColorType) {
        setSavedColorWiseType(targetColorType);
      }
      setStockSuccess(
        isChangingType
          ? "Stock management type updated! All products stocks have been reset and reconfigured to match this setting."
          : "Stock management configuration saved successfully! All store products now follow this setting."
      );
      router.refresh();
    } catch (err: any) {
      setStockError(err.message || "Failed to save stock settings.");
    } finally {
      setSavingStockSettings(false);
    }
  };

  const handleConfirmChange = async (autoSave = false) => {
    const nextStock = pendingStockType || stockManagementType;
    const nextColor = pendingColorWiseType || colorWiseStockType;
    if (pendingStockType) {
      setStockManagementType(pendingStockType);
    }
    if (pendingColorWiseType) {
      setColorWiseStockType(pendingColorWiseType);
    }
    setShowConfirmModal(false);

    if (autoSave && nextStock) {
      await executeSaveStock(nextStock, nextStock === "COLOR_WISE" ? nextColor : null);
    }

    setPendingStockType(null);
    setPendingColorWiseType(null);
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setPendingStockType(null);
    setPendingColorWiseType(null);
  };

  // Read URL query parameter for tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        ["general", "products", "orders", "theme", "domain", "payments", "customerAuth"].includes(tabParam)
      ) {
        setActiveTab(tabParam as SettingsTab);
      }
    }
  }, []);

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
  const [rzpStatus, setRzpStatus] = useState<RazorpayStatus>(null);
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

  // Shipping settings
  const [shippingType, setShippingType] = useState<string | null>(
    (store.settings as any)?.shippingType ?? null
  );
  const [shippingFixedCharge, setShippingFixedCharge] = useState<string>(
    (store.settings as any)?.shippingFixedCharge !== undefined && (store.settings as any)?.shippingFixedCharge !== null
      ? String((store.settings as any).shippingFixedCharge)
      : ""
  );
  const [shippingMinOrderAmount, setShippingMinOrderAmount] = useState<string>(
    (store.settings as any)?.shippingMinOrderAmount !== undefined && (store.settings as any)?.shippingMinOrderAmount !== null
      ? String((store.settings as any).shippingMinOrderAmount)
      : ""
  );
  const [shippingFallbackCharge, setShippingFallbackCharge] = useState<string>(
    (store.settings as any)?.shippingFallbackCharge !== undefined && (store.settings as any)?.shippingFallbackCharge !== null
      ? String((store.settings as any).shippingFallbackCharge)
      : ""
  );
  const [shippingDefaultWeight, setShippingDefaultWeight] = useState<string>(
    (store.settings as any)?.shippingDefaultWeight !== undefined && (store.settings as any)?.shippingDefaultWeight !== null
      ? String((store.settings as any).shippingDefaultWeight)
      : ""
  );
  const [shippingWeightRates, setShippingWeightRates] = useState<
    Array<{ id?: string; minWeight: number; maxWeight: number; charge: number }>
  >(() => {
    if (Array.isArray((store.settings as any)?.shippingWeightRates)) {
      return (store.settings as any).shippingWeightRates;
    }
    return [];
  });

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState(store.theme?.primaryColor || "#3b82f6");
  const [navbarBg, setNavbarBg] = useState(store.theme?.navbarBg || "#ffffff");
  const [navbarText, setNavbarText] = useState(store.theme?.navbarText || "#111827");
  const [buttonBg, setButtonBg] = useState(store.theme?.buttonBg || "#3b82f6");
  const [buttonText, setButtonText] = useState(store.theme?.buttonText || "#ffffff");
  const [backgroundColor] = useState("#ffffff");
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

  // Connect / Update Razorpay
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

  const handleSaveStockSettings = async (e?: React.FormEvent, forceSave = false) => {
    if (e) e.preventDefault();
    if (!stockManagementType) {
      setStockError("Please select one of the stock management options.");
      return;
    }

    // If changing from an already configured stock type and not forced
    const isChangingType =
      savedStockType !== null &&
      (stockManagementType !== savedStockType ||
        (stockManagementType === "COLOR_WISE" && colorWiseStockType !== savedColorWiseType));

    if (isChangingType && !forceSave && !showConfirmModal) {
      setPendingStockType(stockManagementType);
      setPendingColorWiseType(stockManagementType === "COLOR_WISE" ? colorWiseStockType : null);
      setConfirmModalForSave(true);
      setShowConfirmModal(true);
      return;
    }

    await executeSaveStock(
      stockManagementType,
      stockManagementType === "COLOR_WISE" ? colorWiseStockType : null
    );
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
            stockManagementType,
            colorWiseStockType: stockManagementType === "COLOR_WISE" ? colorWiseStockType : null,
            shippingType,
            shippingFixedCharge: shippingFixedCharge ? parseFloat(shippingFixedCharge) : null,
            shippingMinOrderAmount: shippingMinOrderAmount ? parseFloat(shippingMinOrderAmount) : null,
            shippingFallbackCharge: shippingFallbackCharge ? parseFloat(shippingFallbackCharge) : null,
            shippingDefaultWeight: shippingDefaultWeight ? parseFloat(shippingDefaultWeight) : null,
            shippingWeightRates,
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
          backgroundColor: "#ffffff",
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
      <StoreUrlBanner
        storeUrl={storeUrl}
        storeSlug={store.slug}
        copied={copied}
        onCopyLink={handleCopyLink}
      />

      {/* Settings Navigation Tabs */}
      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDomainTabClick={handleDomainTabClick}
        onPaymentsTabClick={handlePaymentsTabClick}
        onCustomerAuthTabClick={() => {
          setActiveTab("customerAuth");
          loadCustomerAuthConfig();
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: GENERAL & BRAND */}
        {activeTab === "general" && (
          <GeneralTab
            name={name}
            setName={setName}
            businessType={businessType}
            setBusinessType={setBusinessType}
            description={description}
            setDescription={setDescription}
            logoUrl={logoUrl}
            onLogoUpload={handleLogoUpload}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            address={address}
            setAddress={setAddress}
          />
        )}

        {/* TAB 2: PRODUCT MANAGEMENT (STOCK MANAGEMENT) */}
        {activeTab === "products" && (
          <ProductsTab
            stockManagementType={stockManagementType}
            colorWiseStockType={colorWiseStockType}
            savedStockType={savedStockType}
            savedColorWiseType={savedColorWiseType}
            savingStockSettings={savingStockSettings}
            stockSuccess={stockSuccess}
            stockError={stockError}
            onRequestStockTypeChange={handleRequestStockTypeChange}
            onRequestColorWiseTypeChange={handleRequestColorWiseTypeChange}
            onSaveStockSettings={() => handleSaveStockSettings()}
          />
        )}

        {/* TAB 3: ORDER METHODS & SHIPPING */}
        {activeTab === "orders" && (
          <OrdersTab
            ordersEnabled={ordersEnabled}
            setOrdersEnabled={setOrdersEnabled}
            codEnabled={codEnabled}
            setCodEnabled={setCodEnabled}
            onlinePaymentEnabled={onlinePaymentEnabled}
            setOnlinePaymentEnabled={setOnlinePaymentEnabled}
            whatsappOrderEnabled={whatsappOrderEnabled}
            setWhatsappOrderEnabled={setWhatsappOrderEnabled}
            shippingType={shippingType}
            setShippingType={setShippingType}
            shippingFixedCharge={shippingFixedCharge}
            setShippingFixedCharge={setShippingFixedCharge}
            shippingMinOrderAmount={shippingMinOrderAmount}
            setShippingMinOrderAmount={setShippingMinOrderAmount}
            shippingFallbackCharge={shippingFallbackCharge}
            setShippingFallbackCharge={setShippingFallbackCharge}
            shippingDefaultWeight={shippingDefaultWeight}
            setShippingDefaultWeight={setShippingDefaultWeight}
            shippingWeightRates={shippingWeightRates}
            setShippingWeightRates={setShippingWeightRates}
          />
        )}

        {/* TAB 4: THEME & STYLING WITH LIVE PREVIEW */}
        {activeTab === "theme" && (
          <ThemeTab
            name={name}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            navbarBg={navbarBg}
            setNavbarBg={setNavbarBg}
            navbarText={navbarText}
            setNavbarText={setNavbarText}
            buttonBg={buttonBg}
            setButtonBg={setButtonBg}
            buttonText={buttonText}
            setButtonText={setButtonText}
            textColor={textColor}
            setTextColor={setTextColor}
            h1Color={h1Color}
            setH1Color={setH1Color}
            h2Color={h2Color}
            setH2Color={setH2Color}
            paragraphColor={paragraphColor}
            setParagraphColor={setParagraphColor}
            buttonShape={buttonShape}
            setButtonShape={setButtonShape}
            primaryFont={primaryFont}
            setPrimaryFont={setPrimaryFont}
          />
        )}

        {/* TAB 5: CUSTOM DOMAIN */}
        {activeTab === "domain" && (
          <DomainTab
            customDomain={customDomain}
            setCustomDomain={setCustomDomain}
            domainStatus={domainStatus}
            verificationToken={verificationToken}
            loading={loading}
            verifyingDomain={verifyingDomain}
            disconnectingDomain={disconnectingDomain}
            copiedToken={copiedToken}
            copiedRouting={copiedRouting}
            onSaveDomain={handleSaveDomain}
            onVerifyDomain={handleVerifyDomain}
            onDisconnectDomain={handleDisconnectDomain}
            onCopyToken={() => {
              navigator.clipboard.writeText(verificationToken);
              setCopiedToken(true);
              setTimeout(() => setCopiedToken(false), 2000);
            }}
            onCopyRouting={(val) => {
              navigator.clipboard.writeText(val);
              setCopiedRouting(true);
              setTimeout(() => setCopiedRouting(false), 2000);
            }}
          />
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === "payments" && (
          <PaymentsTab
            rzpStatus={rzpStatus}
            rzpLoading={rzpLoading}
            rzpSaving={rzpSaving}
            rzpDisconnecting={rzpDisconnecting}
            rzpKeyId={rzpKeyId}
            setRzpKeyId={setRzpKeyId}
            rzpKeySecret={rzpKeySecret}
            setRzpKeySecret={setRzpKeySecret}
            rzpMode={rzpMode}
            setRzpMode={setRzpMode}
            rzpShowSecret={rzpShowSecret}
            setRzpShowSecret={setRzpShowSecret}
            rzpError={rzpError}
            rzpSuccess={rzpSuccess}
            rzpConfirmDisconnect={rzpConfirmDisconnect}
            setRzpConfirmDisconnect={setRzpConfirmDisconnect}
            onConnect={handleRzpConnect}
            onDisconnect={handleRzpDisconnect}
          />
        )}

        {/* TAB 7: CUSTOMER AUTHENTICATION (GOOGLE OAUTH) */}
        {activeTab === "customerAuth" && (
          <CustomerAuthTab
            storeSlug={store.slug}
            googleAuthEnabled={googleAuthEnabled}
            setGoogleAuthEnabled={setGoogleAuthEnabled}
            googleClientId={googleClientId}
            setGoogleClientId={setGoogleClientId}
            googleClientSecret={googleClientSecret}
            setGoogleClientSecret={setGoogleClientSecret}
            hasGoogleClientSecret={hasGoogleClientSecret}
            googleAuthLoading={googleAuthLoading}
            googleAuthSaving={googleAuthSaving}
            googleAuthSuccess={googleAuthSuccess}
            googleAuthError={googleAuthError}
            isEditingSecret={isEditingSecret}
            setIsEditingSecret={setIsEditingSecret}
            copiedCallback={copiedCallback}
            setCopiedCallback={setCopiedCallback}
            onSave={handleSaveCustomerAuth}
          />
        )}

        {/* Global Save Button (for General, Order Methods and Theme only) */}
        {activeTab !== "domain" && activeTab !== "payments" && activeTab !== "customerAuth" && (
          <div className="sticky bottom-4 sm:bottom-6 z-30 flex items-center justify-end pointer-events-none pt-4 pb-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="pointer-events-auto shadow-xl shadow-blue-600/30 font-semibold"
            >
              Save All Changes
            </Button>
          </div>
        )}
      </form>

      {/* Stock Management Type Change Confirmation Modal */}
      <StockConfirmModal
        isOpen={showConfirmModal}
        confirmModalForSave={confirmModalForSave}
        savedStockType={savedStockType}
        savedColorWiseType={savedColorWiseType}
        pendingStockType={pendingStockType}
        pendingColorWiseType={pendingColorWiseType}
        stockManagementType={stockManagementType}
        colorWiseStockType={colorWiseStockType}
        savingStockSettings={savingStockSettings}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      />
    </div>
  );
}
