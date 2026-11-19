"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader2, User, Mail, Lock, Phone, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { getStoreLink } from "@/lib/store-url";

export type CustomerAuthMode = "login" | "register" | "forgot_password" | "reset_password";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: CustomerAuthMode;
  storeSlug: string;
  storeName: string;
  googleEnabled?: boolean;
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  storeSlug,
  storeName,
  googleEnabled = false,
}: CustomerAuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CustomerAuthMode>(initialMode);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Step 1: Forgot password form states (request verification email)
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Step 2: Reset password form states (after email verification via token link)
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode and query parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const auth = params.get("auth");

        if (token || auth === "reset_password") {
          setResetToken(token || "");
          setMode("reset_password");
        } else if (auth === "forgot_password" || auth === "forgot-password") {
          setMode("forgot_password");
        } else {
          setMode(initialMode);
        }

        if (params.get("error") === "oauth_failed") {
          setError("Google sign-in was cancelled or failed. Please try again.");
        } else {
          setError(null);
        }
      } else {
        setMode(initialMode);
        setError(null);
      }
    }
  }, [isOpen, initialMode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 1. Submit Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/stores/${storeSlug}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username/email or password.");
      }

      onClose();
      router.push(getStoreLink(storeSlug, "/account"));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError("Name, email, and password are required.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/stores/${storeSlug}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          username: regUsername.trim() || undefined,
          phone: regPhone.trim() || undefined,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account.");
      }

      onClose();
      router.push(getStoreLink(storeSlug, "/account"));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Step 1: Submit Forgot Password (Email verification request)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your account email address.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/stores/${storeSlug}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send reset link.");
      }

      setForgotSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Step 2: Submit Reset Password (with verified token from email)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setError("Verification token is missing. Please click the link sent to your email or enter the token.");
      return;
    }
    if (!resetPassword) {
      setError("Please enter your new password.");
      return;
    }
    if (resetPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/stores/${storeSlug}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken.trim(),
          password: resetPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setResetSuccess(true);
      setTimeout(() => {
        onClose();
        setResetSuccess(false);
        router.push(getStoreLink(storeSlug, "/account"));
        router.refresh();
      }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const switchToForgotPassword = () => {
    if (loginIdentifier.trim() && loginIdentifier.includes("@")) {
      setForgotEmail(loginIdentifier.trim());
    }
    setError(null);
    setForgotSent(false);
    setMode("forgot_password");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--store-surface, #ffffff)",
              borderColor: "var(--store-border, rgba(0, 0, 0, 0.1))",
              color: "var(--store-page-text, inherit)",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/10 transition-all"
              style={{ color: "var(--store-page-text, inherit)" }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Back button when in forgot or reset password mode */}
            {(mode === "forgot_password" || mode === "reset_password") && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setForgotSent(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 mb-3 transition-opacity"
                style={{ color: "var(--store-primary, #3b82f6)" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}

            {/* Header info */}
            <div className="text-center mb-6">
              <h2
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{ color: "var(--store-page-heading, #ffffff)" }}
              >
                {mode === "login"
                  ? "Welcome Back"
                  : mode === "register"
                  ? "Create Account"
                  : mode === "forgot_password"
                  ? (forgotSent ? "Check Your Email" : "Forgot Password")
                  : "Set New Password"}
              </h2>
              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: "var(--store-page-muted, #94a3b8)" }}
              >
                {mode === "login"
                  ? `Sign in to access your orders at ${storeName}`
                  : mode === "register"
                  ? `Join ${storeName} to track orders & manage your profile`
                  : mode === "forgot_password"
                  ? (forgotSent
                      ? `We sent verification instructions to your email address`
                      : `Enter your email to receive a password reset link`)
                  : `Enter your new password below to update your account`}
              </p>
            </div>

            {/* Segmented Switcher (Login vs Register) - Only show when NOT in forgot/reset mode */}
            {(mode === "login" || mode === "register") && (
              <div
                className="flex p-1 rounded-xl mb-6 bg-transparent"
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--store-button-radius, 10px)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold transition-all ${
                    mode === "login"
                      ? "shadow-sm"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    borderRadius: "var(--store-button-radius, 10px)",
                    backgroundColor: mode === "login" ? "var(--store-button-bg, #7c3aed)" : "transparent",
                    color: mode === "login" ? "var(--store-button-text, #ffffff)" : "var(--store-page-text, inherit)",
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold transition-all ${
                    mode === "register"
                      ? "shadow-sm"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    borderRadius: "var(--store-button-radius, 10px)",
                    backgroundColor: mode === "register" ? "var(--store-button-bg, #7c3aed)" : "transparent",
                    color: mode === "register" ? "var(--store-button-text, #ffffff)" : "var(--store-page-text, inherit)",
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            {/* Success Banner (for reset password) */}
            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Password updated successfully! Redirecting to your account…</span>
              </div>
            )}

            {/* Google OAuth (if enabled and in login/register mode) */}
            {googleEnabled && (mode === "login" || mode === "register") && (
              <div className="mb-5 space-y-4">
                <a
                  href={`/api/stores/${storeSlug}/auth/google`}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm hover:opacity-90 active:scale-[0.99] bg-transparent"
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "var(--store-button-radius, 10px)",
                    color: "var(--store-page-text, inherit)",
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </a>

                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      className="w-full border-t border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div
                    className="relative px-3 text-[11px] uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--store-surface, #ffffff)",
                      color: "var(--store-page-muted, #94a3b8)",
                    }}
                  >
                    Or with credentials
                  </div>
                </div>
              </div>
            )}

            {/* ── Mode 1: Sign In ─────────────────────────────────────── */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-identifier"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-identifier"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="Enter email or username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="modal-password"
                      className="block text-xs font-semibold"
                      style={{ color: "var(--store-page-text, inherit)" }}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={switchToForgotPassword}
                      className="text-[11px] hover:underline font-semibold"
                      style={{ color: "var(--store-primary, #3b82f6)" }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In…</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            )}

            {/* ── Mode 2: Create Account ─────────────────────────────── */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label
                    htmlFor="modal-reg-name"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-reg-name"
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="modal-reg-email"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-reg-email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="modal-reg-user"
                      className="block text-xs font-semibold"
                      style={{ color: "var(--store-page-text, inherit)" }}
                    >
                      Username <span className="opacity-50 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      id="modal-reg-user"
                      type="text"
                      placeholder="Enter username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="modal-reg-phone"
                      className="block text-xs font-semibold"
                      style={{ color: "var(--store-page-text, inherit)" }}
                    >
                      Phone <span className="opacity-50 text-[10px]">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                      <input
                        id="modal-reg-phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-10 pl-8 pr-2.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                        style={{
                          border: "1px solid #cbd5e1",
                          backgroundColor: "transparent",
                          color: "var(--store-page-text, inherit)",
                          borderRadius: "var(--store-input-radius, 10px)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="modal-reg-password"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-reg-password"
                      type={showRegPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Enter password (min 6 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            )}

            {/* ── Mode 3: Forgot Password (Step 1: Enter email to receive verification link) ── */}
            {mode === "forgot_password" && (
              <div>
                {!forgotSent ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="modal-forgot-email"
                        className="block text-xs font-semibold"
                        style={{ color: "var(--store-page-text, inherit)" }}
                      >
                        Account Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <input
                          id="modal-forgot-email"
                          type="email"
                          required
                          placeholder="Enter your email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                          style={{
                            border: "1px solid #cbd5e1",
                            backgroundColor: "transparent",
                            color: "var(--store-page-text, inherit)",
                            borderRadius: "var(--store-input-radius, 10px)",
                          }}
                        />
                      </div>
                      <p className="text-[11px] opacity-60">
                        We will send a secure password reset link to this email address.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 mt-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--store-button-bg, #22c55e)",
                        color: "var(--store-button-text, #ffffff)",
                        borderRadius: "var(--store-button-radius, 10px)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Link…</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Confirmation State after sending verification link */
                  <div className="text-center py-4 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
                      <Mail className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold" style={{ color: "var(--store-page-heading, #ffffff)" }}>
                        Verification Link Sent!
                      </h3>
                      <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
                        We sent a password reset link to <strong className="text-white font-medium">{forgotEmail}</strong>.
                        Please check your inbox (and spam folder) and click the link to verify your email and set your new password.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setForgotSent(false);
                          setError(null);
                        }}
                        className="w-full h-10 text-xs font-bold border transition-all hover:opacity-90"
                        style={{
                          borderRadius: "var(--store-button-radius, 10px)",
                          borderColor: "var(--store-border, rgba(255, 255, 255, 0.15))",
                          backgroundColor: "rgba(0,0,0,0.2)",
                        }}
                      >
                        Back to Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setForgotSent(false)}
                        className="text-[11px] font-medium opacity-60 hover:opacity-100 hover:underline"
                        style={{ color: "var(--store-primary, #3b82f6)" }}
                      >
                        Didn&apos;t receive email? Try another email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Mode 4: Reset Password (Step 2: Shown when verified via email link with token) ── */}
            {mode === "reset_password" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {/* If token wasn't automatically parsed from URL, provide input */}
                {!resetToken && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="modal-reset-token"
                      className="block text-xs font-semibold"
                      style={{ color: "var(--store-page-text, inherit)" }}
                    >
                      Verification Token
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        id="modal-reset-token"
                        type="text"
                        required
                        placeholder="Paste verification token from email"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all font-mono placeholder:text-slate-400"
                        style={{
                          border: "1px solid #cbd5e1",
                          backgroundColor: "transparent",
                          color: "var(--store-page-text, inherit)",
                          borderRadius: "var(--store-input-radius, 10px)",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-reset-password"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-reset-password"
                      type={showResetPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Enter new password (min 6 characters)"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-reset-confirm"
                    className="block text-xs font-semibold"
                    style={{ color: "var(--store-page-text, inherit)" }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      id="modal-reset-confirm"
                      type={showResetConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Confirm your new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:!border-blue-500 transition-all placeholder:text-slate-400"
                      style={{
                        border: "1px solid #cbd5e1",
                        backgroundColor: "transparent",
                        color: "var(--store-page-text, inherit)",
                        borderRadius: "var(--store-input-radius, 10px)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetSuccess}
                  className="w-full h-11 mt-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <span>Update Password &amp; Sign In</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Toggle Note */}
            <div className="mt-5 text-center text-xs opacity-75">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: "var(--store-primary, #3b82f6)" }}
                  >
                    Sign up now
                  </button>
                </p>
              ) : mode === "register" ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: "var(--store-primary, #3b82f6)" }}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setForgotSent(false);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: "var(--store-primary, #3b82f6)" }}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
