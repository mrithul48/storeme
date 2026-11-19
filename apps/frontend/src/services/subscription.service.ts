// apps/frontend/src/services/subscription.service.ts
import { apiClient } from "@/lib/api/api-client";
import { auth } from "@/lib/auth";

export async function getCurrentSubscription(storeId: string) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const userId = session.user?.id || session.user?.email || "";

  const res = await apiClient.get<any>("/api/v1/subscriptions/current", {
    storeId,
    internalUser: {
      id: userId,
      email: session.user.email,
      role: session.user.role,
    },
  });

  return res.data;
}

export async function initiateSubscriptionCheckout(
  storeId: string,
  planId: string,
  billingPeriod: "MONTHLY" | "YEARLY" = "YEARLY",
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const res = await apiClient.post<any>(
    "/api/v1/subscriptions/checkout",
    { planId, billingPeriod },
    {
      storeId,
      internalUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    },
  );

  return res.data;
}

export async function verifySubscriptionPayment(
  storeId: string,
  params: {
    planId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    billingPeriod?: "MONTHLY" | "YEARLY";
  },
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const res = await apiClient.post<any>(
    "/api/v1/subscriptions/verify",
    params,
    {
      storeId,
      internalUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    },
  );

  return res;
}

export async function cancelSubscription(storeId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const res = await apiClient.post<any>(
    "/api/v1/subscriptions/cancel",
    { reason },
    {
      storeId,
      internalUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    },
  );

  return res;
}

