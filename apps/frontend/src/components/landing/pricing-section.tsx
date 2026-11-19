"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, HelpCircle, ChevronDown, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { PlanItem } from "@/services/plan.service";

interface PricingSectionProps {
  plans: PlanItem[];
  cmsData?: {
    pricingHeading?: string | null;
    pricingDescription?: string | null;
    pricingBadge?: string | null;
    yearlySavingsPercent?: number;
    pricingFaqs?: Array<{ question: string; answer: string }> | null;
  } | null;
  isAuthenticated?: boolean;
}

export function PricingSection({ plans, cmsData, isAuthenticated }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const heading = cmsData?.pricingHeading || "Transparent Plans for Every Store";
  const description =
    cmsData?.pricingDescription ||
    "No surprise platform fees. Keep all your profits with our scalable SaaS plans.";
  const badgeText = cmsData?.pricingBadge || "Simple Pricing";
  const savingsPercent = cmsData?.yearlySavingsPercent || 20;

  const faqs = cmsData?.pricingFaqs && cmsData.pricingFaqs.length > 0
    ? cmsData.pricingFaqs
    : [
        {
          question: "Can I upgrade or downgrade my plan at any time?",
          answer:
            "Yes, you can upgrade your plan at any moment from your Merchant Dashboard. Upgrades take effect immediately with prorated billing.",
        },
        {
          question: "What payment gateways are supported?",
          answer:
            "We natively support Razorpay for UPI, NetBanking, Credit/Debit cards, plus instant Cash on Delivery and direct WhatsApp ordering.",
        },
        {
          question: "Are there any hidden transaction fees?",
          answer:
            "LaunchCommerce charges 0% platform transaction fees on COD and WhatsApp orders. Standard Razorpay payment gateway fees apply for online payments.",
        },
        {
          question: "What happens if I exceed my product limits?",
          answer:
            "You can easily upgrade your plan with one click to unlock higher or unlimited product quotas without interruption to your live storefront.",
        },
      ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          {badgeText}
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {heading}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {description}
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingPeriod("MONTHLY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === "MONTHLY"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("YEARLY")}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "YEARLY"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save {savingsPercent}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isYearly = billingPeriod === "YEARLY";
          const displayPrice = isYearly
            ? plan.yearlyPrice !== null && plan.yearlyPrice !== undefined
              ? plan.yearlyPrice
              : Math.round(plan.price * 12 * (1 - savingsPercent / 100))
            : plan.price;

          const periodLabel = isYearly ? "/ year" : "/ month";
          const isFeatured = plan.isFeatured;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between p-8 relative rounded-3xl transition-all duration-300 ${
                isFeatured
                  ? "border-blue-500/60 bg-gradient-to-b from-blue-950/30 via-slate-900/80 to-slate-900/90 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {/* Badge if featured or custom badge */}
              {(plan.badge || isFeatured) && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                    <Zap className="w-3 h-3" />
                    {plan.badge || "Most Popular"}
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2">
                    {plan.description || "Everything you need to launch and grow."}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {periodLabel}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      Billed annually (₹{Math.round(displayPrice / 12).toLocaleString("en-IN")}/mo)
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan Highlights
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {/* Products limit */}
                    <li className="flex items-start gap-2.5">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        {plan.maxProducts
                          ? `Up to ${plan.maxProducts} active products`
                          : "Unlimited products catalog"}
                      </span>
                    </li>

                    {/* Custom Domain */}
                    <li className="flex items-start gap-2.5">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        {plan.customDomainAccess
                          ? "Custom domain linking (.com / .in)"
                          : "Dedicated launchcommerce.shop subdomain"}
                      </span>
                    </li>

                    {/* Analytics */}
                    <li className="flex items-start gap-2.5">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        {plan.advancedAnalytics
                          ? "Advanced revenue analytics & cohort charts"
                          : "Standard order & revenue reporting"}
                      </span>
                    </li>

                    {/* Premium Themes */}
                    {plan.premiumThemes && (
                      <li className="flex items-start gap-2.5">
                        <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Premium boutique & modern storefront themes</span>
                      </li>
                    )}

                    {/* Custom dynamic features */}
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to action */}
              <div className="pt-8">
                <Link
                  href={
                    isAuthenticated
                      ? `/dashboard/subscription?plan=${plan.id}&period=${billingPeriod}`
                      : `/auth/signin?plan=${plan.id}&period=${billingPeriod}`
                  }
                  className="block"
                >
                  <Button
                    variant={isFeatured ? "primary" : "secondary"}
                    size="lg"
                    className="w-full text-xs font-bold shadow-lg"
                  >
                    <span>Get Started with {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-5xl mx-auto pt-12 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Detailed Feature Comparison
          </h3>
          <p className="text-xs text-slate-400">
            Compare capabilities across every LaunchCommerce tier.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 font-bold text-slate-200">Capability</th>
                {plans.map((p) => (
                  <th key={p.id} className="p-4 font-bold text-center text-white">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-4 font-medium text-slate-300">Product Quota</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center font-semibold text-slate-200">
                    {p.maxProducts ? `${p.maxProducts} Products` : "Unlimited"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">Custom Domain Support</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.customDomainAccess ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">Advanced Analytics</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.advancedAnalytics ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">Premium Themes</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.premiumThemes ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">Razorpay Payment Gateway</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">WhatsApp Direct Ordering</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-300">Platform Transaction Fee</td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center font-bold text-emerald-400">
                    0%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="max-w-3xl mx-auto pt-16 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Common Questions
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-200">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

