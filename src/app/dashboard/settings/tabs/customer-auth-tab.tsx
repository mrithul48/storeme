"use client";

import React from "react";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Key,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CustomerAuthTabProps {
  storeSlug: string;
  googleAuthEnabled: boolean;
  setGoogleAuthEnabled: (val: boolean) => void;
  googleClientId: string;
  setGoogleClientId: (val: string) => void;
  googleClientSecret: string;
  setGoogleClientSecret: (val: string) => void;
  hasGoogleClientSecret: boolean;
  googleAuthLoading: boolean;
  googleAuthSaving: boolean;
  googleAuthSuccess: string | null;
  googleAuthError: string | null;
  isEditingSecret: boolean;
  setIsEditingSecret: (val: boolean) => void;
  copiedCallback: boolean;
  setCopiedCallback: (val: boolean) => void;
  onSave: () => void;
}

export function CustomerAuthTab({
  storeSlug,
  googleAuthEnabled,
  setGoogleAuthEnabled,
  googleClientId,
  setGoogleClientId,
  googleClientSecret,
  setGoogleClientSecret,
  hasGoogleClientSecret,
  googleAuthLoading,
  googleAuthSaving,
  googleAuthSuccess,
  googleAuthError,
  isEditingSecret,
  setIsEditingSecret,
  copiedCallback,
  setCopiedCallback,
  onSave,
}: CustomerAuthTabProps) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultCallback = `${origin}/api/stores/${storeSlug}/auth/google/callback`;

  return (
    <div className="space-y-6">
      {googleAuthError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {googleAuthError}
        </div>
      )}

      {googleAuthSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {googleAuthSuccess}
        </div>
      )}

      <Card className="space-y-6 bg-transparent sm:bg-white border-0 sm:border sm:border-slate-200/90 shadow-none sm:shadow-sm p-0 sm:p-6 rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/90 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Google Customer Authentication</h2>
              <p className="text-xs text-[#64748B]">
                Allow your store customers to sign in with their Google accounts using your store credentials.
              </p>
            </div>
          </div>
        </div>

        {googleAuthLoading ? (
          <div className="flex items-center justify-center py-12 text-[#64748B] gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
            <span>Loading authentication settings…</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Enable Google Login</p>
                <p className="text-xs text-[#64748B] mt-0.5">
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
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>

            {/* Client ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-400" />
                Google Client ID
              </label>
              <Input
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="Enter Google Client ID"
              />
              <p className="text-[11px] text-[#64748B]">
                Obtain this from your Google Cloud Console OAuth 2.0 Client credentials.
              </p>
            </div>

            {/* Client Secret */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-400" />
                Google Client Secret
              </label>
              {hasGoogleClientSecret && !isEditingSecret ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-[#0F172A] tracking-wider">
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
                      className="text-xs text-[#64748B] hover:text-[#0F172A] underline"
                    >
                      Cancel and keep existing secret
                    </button>
                  )}
                </div>
              )}
              <p className="text-[11px] text-[#64748B]">
                Encrypted server-side using AES-256-GCM. Never exposed to browser or storefront.
              </p>
            </div>

            {/* Authorized Redirect URI */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-[#0F172A]">
                Authorized Redirect URI (Copy to Google Cloud Console)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={defaultCallback}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-[#0F172A] select-all"
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
                  {copiedCallback ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedCallback ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-[11px] text-[#64748B]">
                In Google Cloud Console under Credentials &gt; OAuth 2.0 Client IDs, add this exact URL into &ldquo;Authorized redirect URIs&rdquo;.
              </p>
            </div>

            {/* Save Button for Customer Auth */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 p-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 sm:pt-4 sm:border-t sm:border-slate-200/90 sm:flex sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={googleAuthSaving}
                onClick={onSave}
                className="w-full sm:w-auto h-11 sm:h-auto py-2.5 sm:py-2 text-sm font-bold shadow-sm shadow-blue-500/20"
              >
                Save Authentication Settings
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Email/Password Info Card */}
      <Card className="bg-slate-50 border border-slate-200/90 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-[#0F172A]">Email &amp; Username Authentication</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Email and Username + Password login is always active for your storefront customers with built-in secure scrypt hashing, account registration, and password recovery.
        </p>
      </Card>
    </div>
  );
}
