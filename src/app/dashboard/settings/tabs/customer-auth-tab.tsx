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
                onClick={onSave}
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
  );
}
