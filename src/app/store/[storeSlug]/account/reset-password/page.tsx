import { redirect } from "next/navigation";
import { getStoreLink } from "@/lib/store-url";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { storeSlug } = await params;
  const { token } = await searchParams;
  redirect(getStoreLink(storeSlug, `/?auth=reset_password${token ? `&token=${encodeURIComponent(token)}` : ""}`));
}

