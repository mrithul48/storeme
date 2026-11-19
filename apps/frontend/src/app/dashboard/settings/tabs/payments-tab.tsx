"use client";

import React from "react";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ShieldCheck,
  Unplug,
  Plug,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  Eye,
} from "lucide-react";
import { RazorpayStatus } from "../types";

interface PaymentsTabProps {
  rzpStatus: RazorpayStatus;
  rzpLoading: boolean;
  rzpSaving: boolean;
  rzpDisconnecting: boolean;
  rzpKeyId: string;
  setRzpKeyId: (val: string) => void;
  rzpKeySecret: string;
  setRzpKeySecret: (val: string) => void;
  rzpMode: "test" | "live";
  setRzpMode: (val: "test" | "live") => void;
  rzpShowSecret: boolean;
  setRzpShowSecret: (val: boolean) => void;
  rzpError: string | null;
  rzpSuccess: string | null;
  rzpConfirmDisconnect: boolean;
  setRzpConfirmDisconnect: (val: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PaymentsTab({
  rzpStatus,
  rzpLoading,
  rzpSaving,
  rzpDisconnecting,
  rzpKeyId,
  setRzpKeyId,
  rzpKeySecret,
  setRzpKeySecret,
  rzpMode,
  setRzpMode,
  rzpShowSecret,
  setRzpShowSecret,
  rzpError,
  rzpSuccess,
  rzpConfirmDisconnect,
  setRzpConfirmDisconnect,
  onConnect,
  onDisconnect,
}: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Razorpay Status / Notifications */}
      {rzpSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{rzpSuccess}</span>
        </div>
      )}
      {rzpError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{rzpError}</span>
        </div>
      )}

      {rzpLoading ? (
        <Card className="flex items-center justify-center py-12 bg-[#101A3D] border border-[#202D55] shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#638BFF]" />
          <span className="ml-3 text-[#A5B2D1] text-sm">Loading payment settings...</span>
        </Card>
      ) : (
        <>
          {/* Connection Status Card */}
          {rzpStatus?.connected && (
            <Card className="bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-300">Razorpay Connected</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rzpStatus.mode === "live"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {rzpStatus.mode ?? "test"}
                    </span>
                  </div>
                  <p className="text-xs text-[#A5B2D1]">
                    Key ID:{" "}
                    <span className="font-mono text-[#F5F7FF] font-medium">
                      {rzpStatus.keyId
                        ? `${rzpStatus.keyId.slice(0, 12)}${"..".padEnd(8, "●")}`
                        : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-[#A5B2D1]">
                    Secret: <span className="font-mono text-[#F5F7FF]">●●●●●●●●●●●●●●●●</span>
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
                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <p className="text-sm text-rose-300 font-semibold">
                    Disconnect Razorpay?
                  </p>
                  <p className="text-xs text-[#A5B2D1]">
                    Online payments will be disabled until you reconnect. Existing orders and payment records remain intact.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={rzpDisconnecting}
                      onClick={onDisconnect}
                      className="!bg-[#EF4444] hover:!bg-red-700 text-white"
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
          <Card className="space-y-5 bg-[#101A3D] border border-[#202D55] shadow-sm p-4 sm:p-6 rounded-2xl">
            <div className="border-b border-[#172347] pb-3">
              <h2 className="text-base font-bold text-[#F5F7FF] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
                {rzpStatus?.connected ? "Update Razorpay Credentials" : "Connect Razorpay"}
              </h2>
              <p className="text-xs text-[#A5B2D1] mt-1">
                Connect your Razorpay account so customers can pay online directly into your Razorpay account.
                Your credentials are encrypted and stored securely — never visible to anyone.
              </p>
            </div>

            <div className="space-y-4">
              {/* Mode selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#F5F7FF]">Account Mode</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rzpMode"
                      value="test"
                      checked={rzpMode === "test"}
                      onChange={() => setRzpMode("test")}
                      className="accent-[#4169E1]"
                    />
                    <span className="text-sm text-[#F5F7FF]">Test Mode</span>
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
                    <span className="text-sm text-[#F5F7FF]">Live Mode</span>
                  </label>
                </div>
                {rzpMode === "live" && (
                  <p className="text-[11px] text-amber-400">
                    ⚠ Live mode will charge real money. Ensure your credentials are from a verified Razorpay account.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#F5F7FF]">Key ID *</label>
                <Input
                  required
                  value={rzpKeyId}
                  onChange={(e) => setRzpKeyId(e.target.value)}
                  placeholder={rzpMode === "live" ? "Enter Razorpay Live Key ID (rzp_live_...)" : "Enter Razorpay Test Key ID (rzp_test_...)"}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#F5F7FF]">Key Secret *</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7181A8] hover:text-[#F5F7FF]"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#7181A8]">
                  Your secret is encrypted with AES-256-GCM before storage. It is never visible or logged after saving.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={rzpSaving}
                  onClick={onConnect}
                >
                  <Plug className="w-4 h-4 mr-1.5" />
                  {rzpStatus?.connected ? "Update Credentials" : "Connect Razorpay"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Help Card */}
          <Card className="bg-[#101A3D] border border-[#202D55] shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-[#F5F7FF]">Need help?</h3>
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
            <p className="text-xs text-[#A5B2D1]">
              Find your API keys at Dashboard → Settings → API Keys in your Razorpay account.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
