"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/utils";
import { Store, Phone, Palette, ArrowRight, ArrowLeft, Check, AlertCircle } from "lucide-react";

const themePresets = [
  { name: "Ocean Blue", color: "#3b82f6" },
  { name: "Emerald Luxe", color: "#10b981" },
  { name: "Royal Violet", color: "#8b5cf6" },
  { name: "Rose Crimson", color: "#f43f5e" },
];

export function OnboardingWizardClient({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "RETAIL",
    description: "",
    email: userEmail || "",
    phone: "",
    whatsapp: "",
    businessAddress: "",
    themeColor: "#3b82f6",
  });

  const previewSlug = generateSlug(formData.businessName || "my-awesome-store");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setError("Please enter your business name.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          description: formData.description.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          whatsapp: formData.whatsapp.trim() || undefined,
          businessAddress: formData.businessAddress.trim() || undefined,
          theme: {
            primaryColor: formData.themeColor,
            accentColor: formData.themeColor,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create store.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to create your store. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6 p-6 sm:p-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold text-slate-300">Identity</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold text-slate-300">Contact</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
            }`}
          >
            3
          </div>
          <span className="text-xs font-semibold text-slate-300">Theme</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Store Identity */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Store / Brand Name *</label>
            <Input
              required
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Apex Apparel, Organic Fresh, NeoTech"
            />
            <p className="text-[11px] text-slate-500">
              Your store URL will be:{" "}
              <span className="text-blue-400 font-mono">/store/{previewSlug}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Category</label>
            <Input
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              placeholder="e.g. Fashion, Electronics, Health, Food"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Store Description</label>
            <Textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief tagline or overview of what your store sells..."
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            onClick={() => {
              if (!formData.businessName.trim()) {
                setError("Please enter your store name.");
                return;
              }
              setError(null);
              setStep(2);
            }}
          >
            Next: Contact Details
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Step 2: Contact Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
            <Input
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+91 9876543210 (For receiving direct customer orders)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Support Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Address</label>
            <Input
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              placeholder="City, State, Country"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-1/3"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => setStep(3)}
            >
              Next: Pick Theme
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Theme Preset & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Choose Brand Color</label>
            <div className="grid grid-cols-2 gap-3">
              {themePresets.map((t) => (
                <button
                  type="button"
                  key={t.color}
                  onClick={() => setFormData((p) => ({ ...p, themeColor: t.color }))}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.themeColor === t.color
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-xs font-semibold">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Summary Preview
            </h4>
            <p className="text-sm font-bold text-white">{formData.businessName}</p>
            <p className="text-xs text-blue-400 font-mono">/store/{previewSlug}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-1/3"
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              variant="emerald"
              size="lg"
              isLoading={loading}
              className="flex-1"
              onClick={handleSubmit}
            >
              🚀 Launch My Store
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
