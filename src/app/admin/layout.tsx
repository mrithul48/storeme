import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import {
  ShieldAlert,
  LayoutDashboard,
  Store,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  Users,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Strict backend role authorization
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "PLATFORM_ADMIN") {
    // Non-platform-admins are rejected from the super admin dashboard
    redirect("/dashboard");
  }

  const navItems = [
    { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
    { label: "All Stores", href: "/admin/stores", icon: Store },
    { label: "Cross-Store Orders", href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex bg-[#050811] text-slate-100">
      {/* Super Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#070b14] flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Platform Admin
              </span>
            </div>
            <p className="text-[11px] text-amber-400 font-semibold tracking-wide uppercase">
              Super-Dashboard • Multi-Tenant
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all group"
                >
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800/80 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all group"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              Merchant View
            </span>
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

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SUPER-ADMIN AREA
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs font-medium text-slate-300">
              {session.user.name || session.user.email} (Platform Admin)
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
