import { redirect } from "next/navigation";
import { getStoreLink } from "@/lib/store-url";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function ForgotPasswordPage({ params }: Props) {
  const { storeSlug } = await params;
  redirect(getStoreLink(storeSlug, "/?auth=forgot_password"));
}
