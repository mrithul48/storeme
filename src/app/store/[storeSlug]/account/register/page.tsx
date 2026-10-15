import { notFound, redirect } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getStoreLink } from "@/lib/store-url";

type RegisterPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: RegisterPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `Create Account — ${store.name}`,
    description: `Create your customer account at ${store.name}.`,
  };
}

export default async function CustomerRegisterPage({ params }: RegisterPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const currentCustomer = await getCurrentCustomer(store.id);
  if (currentCustomer) {
    redirect(getStoreLink(storeSlug, "/account"));
  }

  // Redirect to store page with register modal open
  redirect(getStoreLink(storeSlug, "/?auth=register"));
}
