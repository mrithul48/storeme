import React from "react";
import { prisma } from "@/lib/db";
import {
  AdminTransactionsClient,
  TransactionItem,
} from "./admin-transactions-client";

export default async function AdminTransactionsPage() {
  const payments = await prisma.payment.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          store: { select: { name: true, slug: true } },
          customer: { select: { name: true, email: true } },
        },
      },
    },
  });

  const formatted: TransactionItem[] = payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    provider: p.razorpayPaymentId ? "Razorpay" : "Online Gateway",
    createdAt: p.createdAt,
    orderNumber: p.order?.orderNumber || null,
    storeName: p.order?.store?.name || null,
    storeSlug: p.order?.store?.slug || null,
    customerName: p.order?.customer?.name || null,
    customerEmail: p.order?.customer?.email || null,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Billing & Payment Transactions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Cross-platform transaction logs, Razorpay settlements, and order payment reconciliation.
        </p>
      </div>

      <AdminTransactionsClient initialTransactions={formatted} />
    </div>
  );
}

