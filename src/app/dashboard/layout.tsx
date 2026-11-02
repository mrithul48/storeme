import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { LogOut } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
    <div className="admin-dashboard h-screen flex bg-[#070B24] text-[#F5F7FF] overflow-hidden antialiased font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 h-full border-r border-[#202D55] bg-[#080D28] flex flex-col justify-between hidden md:flex flex-shrink-0 overflow-hidden shadow-2xl shadow-black/40">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4169E1] flex items-center justify-center font-bold text-white shadow-md shadow-[#4169E1]/30">
              L
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#F5F7FF]">
              LaunchCommerce
            </span>
          </div>

          {/* Navigation Links with Section Subheadings */}
          <DashboardNav isPlatformAdmin={isPlatformAdmin} />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#172347] flex-shrink-0 bg-[#080D28]">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#EF4444] bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#070B24]">
        {/* Top Navbar */}
        <DashboardHeader
          storeName={store.name}
          storeSlug={store.slug}
          userName={session.user.name}
          userEmail={session.user.email}
        />

        {/* Page Content */}
        <main className="flex-1 px-3.5 pt-0 pb-24 sm:p-6 md:p-8 sm:pb-8 overflow-y-auto overflow-x-hidden min-h-0 bg-[#070B24] text-[#F5F7FF]">
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
