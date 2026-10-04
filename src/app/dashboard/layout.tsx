import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  ExternalLink,
  LogOut,
  Store as StoreIcon,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const store = await getStoreByOwnerId(session.user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const isPlatformAdmin = session.user.role === "PLATFORM_ADMIN";

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Categories", href: "/dashboard/categories", icon: Layers },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
    { label: "Store Settings", href: "/dashboard/settings", icon: Settings },
    ...(isPlatformAdmin
      ? [{ label: "Super Admin", href: "/admin", icon: ShieldAlert }]
      : []),
  ];

  return (
    <div className="h-screen flex bg-[#070b12] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 h-full border-r border-slate-800/80 bg-[#090e17]/95 flex flex-col justify-between hidden md:flex flex-shrink-0 overflow-hidden">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo & Store Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                L
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                LaunchCommerce
              </span>
            </div>

            {/* Current Store Badge */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Current Store</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-white truncate">{store.name}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all group"
                >
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800/80 space-y-3 flex-shrink-0">
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="flex items-center justify-between p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/25 text-xs font-semibold transition-all group"
          >
            <span className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4" />
              View Live Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-slate-800/80 bg-[#090e17]/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-bold text-white">{store.name}</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all"
            >
              <StoreIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Preview Store</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
                {session.user.name?.[0] || session.user.email[0].toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
