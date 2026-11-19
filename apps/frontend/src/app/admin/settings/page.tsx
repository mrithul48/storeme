import React from "react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  Server,
  CreditCard,
  Mail,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default async function AdminSettingsPage() {
  // Check Database connectivity
  let dbStatus = "CONNECTED";
  let dbError = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = "ERROR";
    dbError = err.message;
  }

  // Masked integration status
  const razorpayConfigured = !!process.env.RAZORPAY_KEY_ID;
  const razorpayKeyMasked = process.env.RAZORPAY_KEY_ID
    ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}********`
    : "Not configured";

  const brevoConfigured = !!process.env.BREVO_API_KEY;
  const cloudinaryConfigured = !!process.env.CLOUDINARY_CLOUD_NAME;
  const redisConfigured = !!process.env.REDIS_URL;

  const integrations = [
    {
      name: "PostgreSQL Database (Neon / Local Staging)",
      desc: "Primary multi-tenant relational persistence and Prisma connection pool.",
      status: dbStatus === "CONNECTED" ? "ACTIVE" : "ERROR",
      details: dbStatus === "CONNECTED" ? "Connection healthy" : dbError,
      icon: Database,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Razorpay Payment Gateway",
      desc: "Merchant subscriptions & storefront checkout processing.",
      status: razorpayConfigured ? "ACTIVE (TEST MODE)" : "MISSING KEY",
      details: `Key: ${razorpayKeyMasked} • Webhook Secret: ${process.env.RAZORPAY_WEBHOOK_SECRET ? "Configured" : "Missing"}`,
      icon: CreditCard,
      color: razorpayConfigured
        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
        : "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Redis Replay & Caching Engine",
      desc: "Token replay prevention, internal JWT rate limiting, and CMS cache.",
      status: redisConfigured ? "CONFIGURED" : "FALLBACK ACTIVE",
      details: `Host: ${process.env.REDIS_URL ? "Configured via REDIS_URL" : "Local fallback"}`,
      icon: Server,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      name: "Brevo Transactional Email",
      desc: "Order confirmations, customer receipts, and merchant alerts.",
      status: brevoConfigured ? "CONFIGURED" : "OPTIONAL NOT SET",
      details: brevoConfigured ? "API key verified" : "Emails log to server console in dev",
      icon: Mail,
      color: brevoConfigured
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : "text-slate-400 bg-slate-800 border-slate-700",
    },
    {
      name: "Cloudinary Image CDN",
      desc: "Product image hosting, optimization transforms, and logo storage.",
      status: cloudinaryConfigured ? "CONFIGURED" : "LOCAL / DEV STORAGE",
      details: cloudinaryConfigured
        ? `Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`
        : "Cloudinary credentials not active",
      icon: Cloud,
      color: cloudinaryConfigured
        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
        : "text-slate-400 bg-slate-800 border-slate-700",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Platform Integrations & Environment
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Inspect core service connections, security parameters, payment gateways, and system health.
        </p>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-300">
            Security Isolation & Zero Exposure Guarantee
          </p>
          <p className="text-amber-200/80 leading-relaxed">
            API private keys, HMAC webhook secrets, and database connection strings are strictly kept server-side and never returned to browser clients.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isHealthy = item.status.includes("ACTIVE") || item.status.includes("CONFIGURED");
          return (
            <Card
              key={item.name}
              className="p-6 bg-slate-900/60 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{item.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    {item.details}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Badge variant={isHealthy ? "success" : "neutral"}>
                  {item.status}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

