import { notFound, redirect } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getStoreLink } from "@/lib/store-url";

type LoginPageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
};

export async function generateMetadata({ params }: LoginPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `Sign In — ${store.name}`,
    description: `Sign in to your customer account at ${store.name}.`,
  };
}

export default async function CustomerLoginPage({ params }: LoginPageProps) {
  const { storeSlug } = await params;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  // If already logged in, redirect to account dashboard
  const currentCustomer = await getCurrentCustomer(store.id);
  if (currentCustomer) {
    redirect(getStoreLink(storeSlug, "/account"));
  }

  // Redirect to store page with modal popup open
  redirect(getStoreLink(storeSlug, "/?auth=login"));
}
