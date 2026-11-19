import React from "react";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getStorefrontConfig } from "@/services/store.service";
import { StorePolicyPage, PolicyPointItem } from "@/components/storefront/store-policy-page";

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Not Found" };

  const hp = store.homePage as Record<string, unknown> | null;
  const heading =
    (hp?.privacyPolicyHeading as string)?.trim() || "Privacy & Security Policy";

  return {
    title: `${heading} — ${store.name}`,
    description: `Read the official privacy and security policy for ${store.name}.`,
  };
}

export default async function PrivacySecurityPolicyPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const heading = (hp?.privacyPolicyHeading as string) || null;
  const description = (hp?.privacyPolicyDescription as string) || null;
  const points = Array.isArray(hp?.privacyPoints)
    ? (hp.privacyPoints as PolicyPointItem[])
    : [];

  return (
    <StorePolicyPage
      store={store}
      policyType="privacy"
      defaultHeading="Privacy & Security Policy"
      icon={ShieldCheck}
      heading={heading}
      description={description}
      points={points}
    />
  );
}
