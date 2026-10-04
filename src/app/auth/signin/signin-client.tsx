"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, AlertCircle, Shield } from "lucide-react";

export function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSignIn = async (userEmail: string, userName?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: userEmail,
        name: userName || userEmail.split("@")[0],
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setError("Sign in failed. Please check credentials.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-6">
      {/* Brand header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-2">
          L
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to LaunchCommerce
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in to manage your stores, orders, products, and analytics.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/60 border-slate-800">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Instant Demo Login (Zero setup required) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Instant One-Click Demo
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Test the platform instantly without entering passwords or OAuth credentials.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={loading}
            onClick={() => handleCredentialsSignIn("founder@launchcommerce.io", "Alex Mercer")}
            className="w-full"
          >
            Sign in as Demo Store Founder
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Custom Email / Name Sign-In */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            handleCredentialsSignIn(email, name);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Your Email Address</label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourbusiness.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Your Name (Optional)</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            Continue with Email
          </Button>
        </form>

        {/* Google OAuth Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-700/80 bg-slate-950/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 pt-2">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Multi-tenant encrypted session • LaunchCommerce SaaS</span>
        </div>
      </Card>
    </div>
  );
}
