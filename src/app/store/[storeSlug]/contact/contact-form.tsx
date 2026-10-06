"use client";

import React, { useState } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface ContactFormProps {
  storeSlug: string;
  themeColor: string;
}

export function ContactForm({ storeSlug }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in Name, Email, and Message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${storeSlug}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send enquiry.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Check className="w-7 h-7" />
        </div>
        <h3
          className="font-bold text-lg"
          style={{ color: "var(--store-page-heading, #ffffff)" }}
        >
          Message Sent!
        </h3>
        <p
          className="text-xs"
          style={{ color: "var(--store-page-muted, #94a3b8)" }}
        >
          Thank you for reaching out. We&apos;ll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-xs underline mt-2"
          style={{ color: "var(--store-primary, #3b82f6)" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputStyle = {
    borderColor: "var(--store-border, rgba(255,255,255,0.15))",
    color: "var(--store-page-text, #ffffff)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-xs font-semibold block"
            style={{ color: "var(--store-page-text, #ffffff)" }}
          >
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            maxLength={100}
            required
            className="flex h-11 w-full rounded-xl border bg-black/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            style={inputStyle}
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-xs font-semibold block"
            style={{ color: "var(--store-page-text, #ffffff)" }}
          >
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            maxLength={200}
            required
            className="flex h-11 w-full rounded-xl border bg-black/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-xs font-semibold block"
          style={{ color: "var(--store-page-text, #ffffff)" }}
        >
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210 (optional)"
          maxLength={20}
          className="flex h-11 w-full rounded-xl border bg-black/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          style={inputStyle}
        />
      </div>

      <div className="space-y-1">
        <label
          className="text-xs font-semibold block"
          style={{ color: "var(--store-page-text, #ffffff)" }}
        >
          Your Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help you..."
          maxLength={2000}
          required
          rows={5}
          className="flex min-h-[120px] w-full rounded-xl border bg-black/5 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "var(--store-button-bg, #22c55e)",
          color: "var(--store-button-text, #ffffff)",
          borderRadius: "var(--store-button-radius, 10px)",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
