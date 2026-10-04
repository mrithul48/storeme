import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInClient } from "./signin-client";

export const metadata = {
  title: "Sign In — LaunchCommerce SaaS",
  description: "Sign in to manage your online store and dashboard.",
};

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <SignInClient />
      </div>
    </div>
  );
}
