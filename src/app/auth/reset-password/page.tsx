"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing or invalid. Please request a new reset link.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="p-8 space-y-6 bg-slate-900/60 border-slate-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Invalid Reset Link</h2>
        <p className="text-sm text-slate-400">
          This password reset link is missing a valid token. Please request a new link from the sign-in page.
        </p>
        <Link href="/auth/signin">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="p-8 space-y-6 bg-slate-900/60 border-slate-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Password Reset Complete</h2>
        <p className="text-sm text-slate-400">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push("/auth/signin")}
        >
          Sign In Now
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/60 border-slate-800">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center mb-2">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Create New Password</h2>
        <p className="text-xs text-slate-400">
          Enter a strong new password with at least 8 characters, a letter, and a number.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">New Password</label>
          <Input
            required
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
          <Input
            required
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full"
        >
          Update Password
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/signin"
          className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to sign in
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-slate-400 text-center py-12">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
