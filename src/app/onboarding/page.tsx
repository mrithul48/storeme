import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { OnboardingWizardClient } from "./onboarding-wizard-client";

export const metadata = {
  title: "Create Your Store — LaunchCommerce",
  description: "Set up your online storefront in under 2 minutes",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id && !session?.user?.email) {
    redirect("/auth/signin");
  }

  let existingStore = session.user?.id ? await getStoreByOwnerId(session.user.id) : null;
  if (!existingStore && session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true },
    });
    if (user) {
      existingStore = await getStoreByOwnerId(user.id);
    }
  }

  if (existingStore) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-500/25 mb-2">
            L
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Name & Launch Your Online Store
          </h1>
          <p className="text-sm text-slate-400">
            Welcome, {session.user.name || "Founder"}! Let's get your store ready to receive orders.
          </p>
        </div>

        {/* Wizard Card */}
        <OnboardingWizardClient userEmail={session.user.email} />
      </div>
    </div>
  );
}
