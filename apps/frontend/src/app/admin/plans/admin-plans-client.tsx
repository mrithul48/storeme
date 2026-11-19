"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { PlanItem } from "@/services/plan.service";

export function AdminPlansClient({ initialPlans }: { initialPlans: PlanItem[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<PlanItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");

  const handleOpenCreate = () => {
    setCurrentPlan({
      name: "",
      slug: "",
      description: "",
      price: 199,
      yearlyPrice: 1999,
      maxProducts: 100,
      customDomainAccess: false,
      advancedAnalytics: false,
      premiumThemes: false,
      sortOrder: plans.length + 1,
      isFeatured: false,
      isPublic: true,
      badge: "",
      status: "ACTIVE",
      features: [],
    });
    setFeaturesInput("");
    setIsEditing(true);
  };

  const handleOpenEdit = (plan: PlanItem) => {
    setCurrentPlan(plan);
    setFeaturesInput(plan.features?.join("\n") || "");
    setIsEditing(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan?.name) {
      alert("Plan name is required");
      return;
    }

    setLoading(true);

    const parsedFeatures = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      ...currentPlan,
      features: parsedFeatures,
      price: Number(currentPlan.price),
      yearlyPrice: currentPlan.yearlyPrice ? Number(currentPlan.yearlyPrice) : null,
      maxProducts: currentPlan.maxProducts ? Number(currentPlan.maxProducts) : null,
      sortOrder: Number(currentPlan.sortOrder || 0),
    };

    try {
      const isNew = !currentPlan.id;
      const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${currentPlan.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save plan");
        return;
      }

      setIsEditing(false);
      setCurrentPlan(null);
      router.refresh();
      // Reload plans locally
      const listRes = await fetch("/api/admin/plans");
      if (listRes.ok) {
        const listData = await listRes.json();
        setPlans(listData.data || []);
      }
    } catch (err) {
      console.error("Save plan error:", err);
      alert("Error saving plan");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (plan: PlanItem) => {
    const nextStatus = plan.status === "ACTIVE" ? "DEPRECATED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "DEPRECATED"
        ? `Deprecate plan "${plan.name}"? Existing subscribers will retain access, but it will be hidden from new storefronts.`
        : `Re-activate plan "${plan.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
        );
        router.refresh();
      } else {
        alert("Failed to update plan status.");
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Error updating plan status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Configured Pricing Tiers ({plans.length})
          </h2>
          <p className="text-xs text-slate-400">
            Create, modify, feature, or soft-deprecate SaaS plans.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isDeprecated = plan.status === "DEPRECATED";
          return (
            <Card
              key={plan.id}
              className={`p-6 space-y-5 rounded-2xl border transition-all ${
                plan.isFeatured
                  ? "border-blue-500/60 bg-gradient-to-b from-blue-950/20 to-slate-900/60"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    slug: {plan.slug || "n/a"}
                  </p>
                </div>

                <Badge
                  variant={
                    plan.status === "ACTIVE"
                      ? "success"
                      : plan.status === "COMING_SOON"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {plan.status}
                </Badge>
              </div>

              {/* Pricing & Subscribers */}
              <div className="pt-2 pb-3 border-y border-slate-800/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-slate-400"> /mo</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300">
                      ₹{plan.yearlyPrice || "—"}
                    </span>
                    <span className="text-xs text-slate-500"> /yr</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Subscribers:</span>
                  <span className="font-bold text-blue-400">
                    {plan.activeSubscriptionsCount ?? 0} active
                  </span>
                </div>
              </div>

              {/* Limits Summary */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Product Quota</span>
                  <span className="font-semibold text-white">
                    {plan.maxProducts ? `${plan.maxProducts} Products` : "Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Custom Domain</span>
                  <span className={plan.customDomainAccess ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                    {plan.customDomainAccess ? "Included" : "Excluded"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Advanced Analytics</span>
                  <span className={plan.advancedAnalytics ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                    {plan.advancedAnalytics ? "Included" : "Excluded"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Public Visibility</span>
                  <span className={plan.isPublic ? "text-emerald-400" : "text-amber-400"}>
                    {plan.isPublic ? "Landing Page" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(plan)}
                  className="text-xs flex-1"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Edit Tier
                </Button>
                <Button
                  variant={isDeprecated ? "secondary" : "danger"}
                  size="sm"
                  onClick={() => handleToggleStatus(plan)}
                  className="text-xs"
                >
                  {isDeprecated ? "Reactivate" : "Deprecate"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit / Create Plan Modal */}
      {isEditing && currentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {currentPlan.id ? `Edit Plan: ${currentPlan.name}` : "Create New Subscription Plan"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Plan Name *
                  </label>
                  <Input
                    value={currentPlan.name || ""}
                    onChange={(e) =>
                      setCurrentPlan({ ...currentPlan, name: e.target.value })
                    }
                    placeholder="e.g. Growth Plan"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Slug
                  </label>
                  <Input
                    value={currentPlan.slug || ""}
                    onChange={(e) =>
                      setCurrentPlan({ ...currentPlan, slug: e.target.value })
                    }
                    placeholder="e.g. growth-plan"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Description
                </label>
                <Input
                  value={currentPlan.description || ""}
                  onChange={(e) =>
                    setCurrentPlan({ ...currentPlan, description: e.target.value })
                  }
                  placeholder="Short tagline for landing page"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Monthly Price (₹) *
                  </label>
                  <Input
                    type="number"
                    value={currentPlan.price ?? 0}
                    onChange={(e) =>
                      setCurrentPlan({ ...currentPlan, price: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Yearly Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={currentPlan.yearlyPrice ?? 0}
                    onChange={(e) =>
                      setCurrentPlan({
                        ...currentPlan,
                        yearlyPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Max Products (blank=unlimited)
                  </label>
                  <Input
                    type="number"
                    value={currentPlan.maxProducts ?? ""}
                    onChange={(e) =>
                      setCurrentPlan({
                        ...currentPlan,
                        maxProducts: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Badge Text (Optional)
                  </label>
                  <Input
                    value={currentPlan.badge || ""}
                    onChange={(e) =>
                      setCurrentPlan({ ...currentPlan, badge: e.target.value })
                    }
                    placeholder="e.g. Most Popular"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    value={currentPlan.sortOrder ?? 1}
                    onChange={(e) =>
                      setCurrentPlan({
                        ...currentPlan,
                        sortOrder: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Feature checkboxes */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Entitlements & Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentPlan.customDomainAccess}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          customDomainAccess: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Custom Domain Linking</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentPlan.advancedAnalytics}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          advancedAnalytics: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Advanced Analytics</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentPlan.premiumThemes}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          premiumThemes: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Premium Themes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentPlan.isFeatured}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Highlight as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentPlan.isPublic !== false}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          isPublic: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Visible on Landing Page</span>
                  </label>
                </div>
              </div>

              {/* Bullet Features Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Custom Bullet Features (one per line)
                </label>
                <textarea
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Priority 24/7 Support&#10;WhatsApp Receipts&#10;Cloudinary Pro CDN"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

