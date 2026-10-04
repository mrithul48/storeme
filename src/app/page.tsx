import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  IndianRupee,
  MessageCircle,
  BarChart3,
  Check,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Fetch active public stores to feature as live demos
  const publicStores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    take: 3,
    include: {
      company: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top SaaS Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#080d17]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/25">
              L
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              LaunchCommerce
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link href="/dashboard">
                <Button variant="primary" size="md">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="primary" size="md">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40 border-b border-slate-900">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Multi-Tenant E-Commerce Builder</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Build, Brand & Scale Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Online Storefront
            </span>{" "}
            in Minutes.
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The lightweight, production-grade e-commerce SaaS for independent brands.
            Get dedicated tenant routing, Razorpay online checkout, WhatsApp direct ordering,
            inventory management, and custom themes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={session?.user ? "/dashboard" : "/auth/signin"}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-blue-500/25">
                Start Your Free Store
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            {publicStores.length > 0 && (
              <Link href={`/store/${publicStores[0].slug}`} target="_blank">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Store className="w-4 h-4 mr-2 text-blue-400" />
                  View Live Demo Store
                </Button>
              </Link>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-900 max-w-4xl mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-500">Tenant Isolation</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 100ms</p>
              <p className="text-xs text-slate-500">Storefront Load Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">0% Fee</p>
              <p className="text-xs text-slate-500">COD & WhatsApp Orders</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Razorpay</p>
              <p className="text-xs text-slate-500">UPI, Cards, NetBanking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Architecture & Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Modern Merchants
          </h2>
          <p className="text-sm text-slate-400">
            Everything business owners need to run their brand without technical complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="space-y-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Tenant Storefronts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every merchant receives a dedicated, brandable storefront URL with SEO meta tags,
              custom colors, logos, and product categories.
            </p>
          </Card>

          <Card className="space-y-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Razorpay & WhatsApp Checkout</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Accept credit cards, UPI, and debit cards with Razorpay, or let customers order
              instantly with one tap directly into your WhatsApp inbox.
            </p>
          </Card>

          <Card className="space-y-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Merchant Dashboard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manage inventory, update order statuses (Confirmed, Shipped, Delivered), track revenue
              aggregates, and view customer directories.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Stores Demo Section */}
      {publicStores.length > 0 && (
        <section className="py-16 bg-slate-900/40 border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Live Merchant Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Stores Powered by LaunchCommerce
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {publicStores.map((store) => (
                <Card key={store.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {store.company?.businessType || "Online Store"}
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{store.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {store.company?.description || "Browse featured items and shop online."}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {store._count.products} products listed
                    </span>
                    <Link
                      href={`/store/${store.slug}`}
                      target="_blank"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      Visit Store
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Transparent Plans for Every Store
          </h2>
          <p className="text-sm text-slate-400">
            No surprise platform fees. Keep all your profits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8">
          {/* Starter Plan */}
          <Card className="space-y-6 relative border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-slate-900/60 p-8 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Growth Plan
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">₹199</span>
                <span className="text-slate-400 text-sm">/ year</span>
              </div>
              <p className="text-xs text-slate-400">
                Ideal for entrepreneurs starting their online boutique or local shop.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Up to 100 Products with Cloudinary image hosting</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Branded Storefront with custom accent theme</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited Cash on Delivery & WhatsApp orders</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Razorpay Online Gateway integration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-Time Order Fulfillment & Inventory Dashboard</span>
              </li>
            </ul>

            <Link href="/auth/signin" className="block pt-2">
              <Button variant="primary" size="lg" className="w-full">
                Get Started with Growth Plan
              </Button>
            </Link>
          </Card>

          {/* Pro Merchant Plan */}
          <Card className="space-y-6 p-8">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Scale Pro
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">₹499</span>
                <span className="text-slate-400 text-sm">/ year</span>
              </div>
              <p className="text-xs text-slate-400">
                For high-volume merchants scaling national brands.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited Products & Categories</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Priority Razorpay Instant Settlement</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Custom Domain Linking (.com / .in)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Brevo Transactional Email & WhatsApp Receipts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>24/7 Dedicated Support</span>
              </li>
            </ul>

            <Link href="/auth/signin" className="block pt-2">
              <Button variant="secondary" size="lg" className="w-full">
                Upgrade to Scale Pro
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#05080e] border-t border-slate-900 text-slate-500 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              L
            </div>
            <span className="font-semibold text-slate-300">LaunchCommerce Platform</span>
            <span>— Production-Grade Multi-Tenant E-Commerce SaaS</span>
          </div>

          <p>© {new Date().getFullYear()} LaunchCommerce Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
