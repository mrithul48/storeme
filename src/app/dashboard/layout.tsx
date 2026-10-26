import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import {
  ExternalLink,
  LogOut,
  Store as StoreIcon,
} from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id && !session?.user?.email) {
    redirect("/auth/signin");
  }

  let store = session.user?.id ? await getStoreByOwnerId(session.user.id) : null;
  if (!store && session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true },
    });
    if (user) {
      store = await getStoreByOwnerId(user.id);
    }
  }

  if (!store) {
    redirect("/onboarding");
  }

  const isPlatformAdmin = session.user.role === "PLATFORM_ADMIN";

  return (
    <div className="h-screen flex bg-white sm:bg-slate-50 text-[#0F172A] overflow-hidden antialiased">
      {/* Desktop Sidebar */}
      <aside className="w-64 h-full border-r border-slate-200/90 bg-white flex flex-col justify-between hidden md:flex flex-shrink-0 overflow-hidden shadow-sm">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/25">
              L
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#0F172A]">
              LaunchCommerce
            </span>
          </div>

          {/* Navigation Links with Section Subheadings */}
          <DashboardNav isPlatformAdmin={isPlatformAdmin} />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white sm:bg-slate-50">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A] text-sm uppercase">{store.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#2563EB] hover:bg-blue-100/80 border border-blue-200/80 transition-all shadow-sm"
            >
              <StoreIcon className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Preview Store</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/90 flex items-center justify-center font-bold text-xs text-[#2563EB]">
                {session.user.name?.[0] || session.user.email[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#0F172A] hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-3.5 pt-0 pb-24 sm:p-6 md:p-8 sm:pb-8 overflow-y-auto overflow-x-hidden min-h-0 bg-white sm:bg-slate-50">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation & Drawer */}
        <MobileNav
          storeName={store.name}
          storeSlug={store.slug}
          isPlatformAdmin={isPlatformAdmin}
        />
      </div>
    </div>
  );
}
