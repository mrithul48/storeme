"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Sparkles,
  Megaphone,
  HelpCircle,
  Plus,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import { PlatformCmsData } from "@/services/platform-cms.service";

export function AdminCmsClient({ initialCms }: { initialCms: PlatformCmsData }) {
  const router = useRouter();
  const [cms, setCms] = useState<PlatformCmsData>(initialCms);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    Array.isArray(initialCms.pricingFaqs) ? initialCms.pricingFaqs : []
  );
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "New FAQ Question?", answer: "Answer description." }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const payload = {
        ...cms,
        yearlySavingsPercent: Number(cms.yearlySavingsPercent),
        pricingFaqs: faqs,
      };

      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update platform CMS");
        return;
      }

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Save CMS error:", err);
      alert("Error saving CMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Top Save Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="info">CMS State: Active</Badge>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Changes published to landing page successfully!
            </span>
          )}
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          <Save className="w-4 h-4 mr-1.5" />
          {loading ? "Publishing..." : "Publish CMS Changes"}
        </Button>
      </div>

      {/* Announcement Bar Settings */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            Top Announcement Banner
          </h2>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={cms.announcementEnabled}
              onChange={(e) =>
                setCms({ ...cms, announcementEnabled: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <span>Enable Announcement</span>
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            Announcement Text
          </label>
          <Input
            value={cms.announcementBar || ""}
            onChange={(e) => setCms({ ...cms, announcementBar: e.target.value })}
            placeholder="e.g. 🚀 LaunchCommerce 2.0 is live! Get 20% off annual plans today."
          />
        </div>
      </Card>

      {/* Hero Section Content */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Hero Section Content
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Hero Pill / Badge Text
            </label>
            <Input
              value={cms.heroBadge || ""}
              onChange={(e) => setCms({ ...cms, heroBadge: e.target.value })}
              placeholder="e.g. The Modern Multi-Tenant E-Commerce Builder"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Hero Main Headline
            </label>
            <Input
              value={cms.heroHeading || ""}
              onChange={(e) => setCms({ ...cms, heroHeading: e.target.value })}
              placeholder="e.g. Build, Brand & Scale Your Online Storefront in Minutes."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Hero Description Paragraph
            </label>
            <textarea
              value={cms.heroDescription || ""}
              onChange={(e) => setCms({ ...cms, heroDescription: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Hero paragraph text..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Primary CTA Button Text
              </label>
              <Input
                value={cms.heroCtaText || ""}
                onChange={(e) => setCms({ ...cms, heroCtaText: e.target.value })}
                placeholder="e.g. Start Your Free Store"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Primary CTA Link Target
              </label>
              <Input
                value={cms.heroCtaLink || ""}
                onChange={(e) => setCms({ ...cms, heroCtaLink: e.target.value })}
                placeholder="e.g. /auth/signin"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Section CMS */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Pricing Section Headings & Discounts
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Pricing Badge
              </label>
              <Input
                value={cms.pricingBadge || ""}
                onChange={(e) => setCms({ ...cms, pricingBadge: e.target.value })}
                placeholder="e.g. Simple Pricing"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Annual Discount Savings (% discount)
              </label>
              <Input
                type="number"
                value={cms.yearlySavingsPercent ?? 20}
                onChange={(e) =>
                  setCms({
                    ...cms,
                    yearlySavingsPercent: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Pricing Section Heading
            </label>
            <Input
              value={cms.pricingHeading || ""}
              onChange={(e) => setCms({ ...cms, pricingHeading: e.target.value })}
              placeholder="e.g. Transparent Plans for Every Store"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Pricing Section Subtitle
            </label>
            <Input
              value={cms.pricingDescription || ""}
              onChange={(e) =>
                setCms({ ...cms, pricingDescription: e.target.value })
              }
              placeholder="e.g. No surprise platform fees. Keep all your profits."
            />
          </div>
        </div>
      </Card>

      {/* Pricing FAQs CMS */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Landing Page Pricing FAQs ({faqs.length})
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFaq}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add FAQ
          </Button>
        </div>

        <div className="space-y-4 pt-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  FAQ #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <Input
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                  placeholder="Question..."
                  className="font-bold text-white"
                />
              </div>

              <div className="space-y-1">
                <textarea
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Answer..."
                />
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              No custom FAQs added yet.
            </p>
          )}
        </div>
      </Card>
    </form>
  );
}
