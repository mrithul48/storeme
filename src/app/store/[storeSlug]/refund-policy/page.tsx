import React from "react";
import { notFound } from "next/navigation";
import { RotateCcw } from "lucide-react";
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
  const heading = (hp?.refundPolicyHeading as string)?.trim() || "Refund Policy";

  return {
    title: `${heading} — ${store.name}`,
    description: `Read the official returns and refund policy for ${store.name}.`,
  };
}

export default async function RefundPolicyPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const heading = (hp?.refundPolicyHeading as string) || null;
  const description = (hp?.refundPolicyDescription as string) || null;
  const points = Array.isArray(hp?.refundPoints)
    ? (hp.refundPoints as PolicyPointItem[])
    : [];

  return (
    <StorePolicyPage
      store={store}
      policyType="refund"
      defaultHeading="Refund Policy"
      icon={RotateCcw}
      heading={heading}
      description={description}
      points={points}
    />
  );
}
