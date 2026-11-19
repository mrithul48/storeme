import React from "react";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
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
  const heading = (hp?.deliveryPolicyHeading as string)?.trim() || "Delivery Policy";

  return {
    title: `${heading} — ${store.name}`,
    description: `Read the official delivery and shipping policy for ${store.name}.`,
  };
}

export default async function DeliveryPolicyPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const heading = (hp?.deliveryPolicyHeading as string) || null;
  const description = (hp?.deliveryPolicyDescription as string) || null;
  const points = Array.isArray(hp?.deliveryPoints)
    ? (hp.deliveryPoints as PolicyPointItem[])
    : [];

  return (
    <StorePolicyPage
      store={store}
      policyType="delivery"
      defaultHeading="Delivery Policy"
      icon={Truck}
      heading={heading}
      description={description}
      points={points}
    />
  );
}
