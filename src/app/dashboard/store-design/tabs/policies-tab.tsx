"use client";

import React, { useState } from "react";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Loader2,
  ListOrdered,
} from "lucide-react";
import { Input, Textarea, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "../_ui/primitives";
import { PolicyPoint, genId } from "../_ui/types";

interface PoliciesTabProps {
  storeSlug: string;
  deliveryPolicyHeading: string;
  setDeliveryPolicyHeading: (v: string) => void;
  deliveryPoints: PolicyPoint[];
  setDeliveryPoints: React.Dispatch<React.SetStateAction<PolicyPoint[]>>;

  refundPolicyHeading: string;
  setRefundPolicyHeading: (v: string) => void;
  refundPoints: PolicyPoint[];
  setRefundPoints: React.Dispatch<React.SetStateAction<PolicyPoint[]>>;

  privacyPolicyHeading: string;
  setPrivacyPolicyHeading: (v: string) => void;
  privacyPoints: PolicyPoint[];
  setPrivacyPoints: React.Dispatch<React.SetStateAction<PolicyPoint[]>>;
}

type PolicyKey = "delivery" | "refund" | "privacy";

export function PoliciesTab({
  storeSlug,
  deliveryPolicyHeading,
  setDeliveryPolicyHeading,
  deliveryPoints,
  setDeliveryPoints,
  refundPolicyHeading,
  setRefundPolicyHeading,
  refundPoints,
  setRefundPoints,
  privacyPolicyHeading,
  setPrivacyPolicyHeading,
  privacyPoints,
  setPrivacyPoints,
}: PoliciesTabProps) {
  const [savingPolicy, setSavingPolicy] = useState<Record<PolicyKey, boolean>>({
    delivery: false,
    refund: false,
    privacy: false,
  });

  const [policySuccess, setPolicySuccess] = useState<Record<PolicyKey, string | null>>({
    delivery: null,
    refund: null,
    privacy: null,
  });

  const [policyError, setPolicyError] = useState<Record<PolicyKey, string | null>>({
    delivery: null,
    refund: null,
    privacy: null,
  });

  // Helpers to add points
  const addPoint = (key: PolicyKey) => {
    const newPoint: PolicyPoint = {
      id: genId(),
      heading: "",
      description: "",
      sortOrder: 0,
    };

    if (key === "delivery") {
      setDeliveryPoints((prev) => [
        ...prev,
        { ...newPoint, sortOrder: prev.length },
      ]);
    } else if (key === "refund") {
      setRefundPoints((prev) => [
        ...prev,
        { ...newPoint, sortOrder: prev.length },
      ]);
    } else if (key === "privacy") {
      setPrivacyPoints((prev) => [
        ...prev,
        { ...newPoint, sortOrder: prev.length },
      ]);
    }
  };

  const updatePoint = (
    key: PolicyKey,
    idx: number,
    field: "heading" | "description",
    val: string
  ) => {
    const updater = (prev: PolicyPoint[]) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p));

    if (key === "delivery") setDeliveryPoints(updater);
    else if (key === "refund") setRefundPoints(updater);
    else if (key === "privacy") setPrivacyPoints(updater);
  };

  const removePoint = (key: PolicyKey, idx: number) => {
    const updater = (prev: PolicyPoint[]) =>
      prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, sortOrder: i }));

    if (key === "delivery") setDeliveryPoints(updater);
    else if (key === "refund") setRefundPoints(updater);
    else if (key === "privacy") setPrivacyPoints(updater);
  };

  // Save individual policy
  const saveIndividualPolicy = async (key: PolicyKey) => {
    setSavingPolicy((prev) => ({ ...prev, [key]: true }));
    setPolicySuccess((prev) => ({ ...prev, [key]: null }));
    setPolicyError((prev) => ({ ...prev, [key]: null }));

    let payload: Record<string, unknown> = {};
    if (key === "delivery") {
      payload = {
        policyType: "delivery",
        deliveryPolicyHeading: deliveryPolicyHeading || null,
        deliveryPoints: deliveryPoints.filter((p) => p.heading.trim() || p.description.trim()),
      };
    } else if (key === "refund") {
      payload = {
        policyType: "refund",
        refundPolicyHeading: refundPolicyHeading || null,
        refundPoints: refundPoints.filter((p) => p.heading.trim() || p.description.trim()),
      };
    } else if (key === "privacy") {
      payload = {
        policyType: "privacy",
        privacyPolicyHeading: privacyPolicyHeading || null,
        privacyPoints: privacyPoints.filter((p) => p.heading.trim() || p.description.trim()),
      };
    }

    try {
      const res = await fetch("/api/stores/current/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save policy");
      }

      const policyLabels: Record<PolicyKey, string> = {
        delivery: "Delivery Policy",
        refund: "Refund Policy",
        privacy: "Privacy & Security Policy",
      };

      setPolicySuccess((prev) => ({
        ...prev,
        [key]: `${policyLabels[key]} saved! Points are live on your store.`,
      }));

      setTimeout(() => {
        setPolicySuccess((prev) => ({ ...prev, [key]: null }));
      }, 5000);
    } catch (err: unknown) {
      setPolicyError((prev) => ({
        ...prev,
        [key]: err instanceof Error ? err.message : "Failed to save policy changes.",
      }));
    } finally {
      setSavingPolicy((prev) => ({ ...prev, [key]: false }));
    }
  };

  const policySections = [
    {
      key: "delivery" as PolicyKey,
      title: "Delivery Policy",
      icon: Truck,
      path: "/delivery-policy",
      pageHeading: deliveryPolicyHeading,
      setPageHeading: setDeliveryPolicyHeading,
      points: deliveryPoints,
      addBtnLabel: "+ Add Delivery Point",
      headingPlaceholder: "Enter delivery point heading",
      descPlaceholder: "Enter delivery policy details and terms...",
    },
    {
      key: "refund" as PolicyKey,
      title: "Refund Policy",
      icon: RotateCcw,
      path: "/refund-policy",
      pageHeading: refundPolicyHeading,
      setPageHeading: setRefundPolicyHeading,
      points: refundPoints,
      addBtnLabel: "+ Add Refund Point",
      headingPlaceholder: "Enter refund point heading",
      descPlaceholder: "Enter return and refund policy details...",
    },
    {
      key: "privacy" as PolicyKey,
      title: "Privacy & Security Policy",
      icon: ShieldCheck,
      path: "/privacy-security-policy",
      pageHeading: privacyPolicyHeading,
      setPageHeading: setPrivacyPolicyHeading,
      points: privacyPoints,
      addBtnLabel: "+ Add Privacy Point",
      headingPlaceholder: "Enter privacy point heading",
      descPlaceholder: "Enter privacy and data protection details...",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-5 border-slate-200/90 bg-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#0F172A]">Store Policies Management</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Add multiple policy points (heading and description) for each policy page. Each point will be displayed
              as a structured section on your live store&apos;s public policy pages.
            </p>
          </div>
        </div>
      </Card>

      {/* Policies */}
      {policySections.map((sec) => {
        const isSaving = savingPolicy[sec.key];
        const successMsg = policySuccess[sec.key];
        const errorMsg = policyError[sec.key];
        const liveUrl = `/store/${storeSlug}${sec.path}`;

        return (
          <Section key={sec.key} title={sec.title} icon={sec.icon}>
            <div className="space-y-5 pt-3">
              {/* Notification Banner */}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{successMsg}</span>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100 underline text-xs"
                  >
                    View Live Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Main Page Title */}
              <div className="space-y-1.5 pb-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Main Page Heading
                  </label>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                  >
                    <span>Preview Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Input
                  value={sec.pageHeading}
                  onChange={(e) => sec.setPageHeading(e.target.value)}
                  placeholder={`e.g. ${sec.title}`}
                  maxLength={200}
                />
                <p className="text-[11px] text-slate-500">
                  Top-level title on the public page. Default: &ldquo;{sec.title}&rdquo;
                </p>
              </div>

              {/* Policy Points List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-blue-400" />
                    Policy Points ({sec.points.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Each point renders with its own heading &amp; description
                  </span>
                </div>

                {sec.points.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50">
                    <p className="text-xs text-[#64748B]">
                      No policy points added yet.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Click below to add your first point (e.g. coverage, eligibility, or security clauses).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {sec.points.map((pt, idx) => (
                      <div
                        key={pt.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] text-[10px] font-extrabold">
                              {idx + 1}
                            </span>
                            Point {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePoint(sec.key, idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete point"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Point Heading */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#0F172A]">
                            Point Heading
                          </label>
                          <Input
                            value={pt.heading}
                            onChange={(e) =>
                              updatePoint(sec.key, idx, "heading", e.target.value)
                            }
                            placeholder={sec.headingPlaceholder}
                            maxLength={200}
                          />
                        </div>

                        {/* Point Description */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#0F172A]">
                            Point Description
                          </label>
                          <Textarea
                            value={pt.description}
                            onChange={(e) =>
                              updatePoint(sec.key, idx, "description", e.target.value)
                            }
                            placeholder={sec.descPlaceholder}
                            className="min-h-[90px] text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Point Button */}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPoint(sec.key)}
                    className="border-slate-200 text-[#2563EB] hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    {sec.addBtnLabel}
                  </Button>
                </div>
              </div>

              {/* Save Footer for this specific policy */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-[#64748B]">
                  {sec.points.length > 0 ? (
                    <span className="text-emerald-700 font-medium">
                      ● {sec.points.length} point{sec.points.length > 1 ? "s" : ""} configured
                    </span>
                  ) : (
                    <span>○ No points added</span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => saveIndividualPolicy(sec.key)}
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            </div>
          </Section>
        );
      })}
    </div>
  );
}
