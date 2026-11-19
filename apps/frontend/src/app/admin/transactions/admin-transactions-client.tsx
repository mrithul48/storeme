"use client";

import React, { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Store,
} from "lucide-react";

export interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string | Date;
  orderNumber?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
}

export function AdminTransactionsClient({
  initialTransactions,
}: {
  initialTransactions: TransactionItem[];
}) {
  const [transactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      search.trim() === "" ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.storeName && t.storeName.toLowerCase().includes(search.toLowerCase())) ||
      (t.customerEmail && t.customerEmail.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSettled = transactions
    .filter((t) => t.status === "PAID" || t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const completedCount = transactions.filter(
    (t) => t.status === "PAID" || t.status === "COMPLETED"
  ).length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Settled Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatCurrency(totalSettled)}
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Settled Transactions</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{completedCount}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending / In-Flight</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{pendingCount}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by payment ID, order number, store name, or customer..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "COMPLETED", "PENDING", "FAILED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-xs"
            >
              {status === "ALL" ? "All Payments" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Payment Reference</th>
                <th className="p-4">Store & Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">
                    {t.id}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">
                      {t.storeName || "Platform Billing"}
                    </div>
                    {t.orderNumber && (
                      <div className="text-[11px] font-mono text-slate-500">
                        Order #{t.orderNumber}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-slate-200">
                      {t.customerName || "Customer"}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {t.customerEmail || "—"}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {t.provider}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        t.status === "PAID" || t.status === "COMPLETED"
                          ? "success"
                          : t.status === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-slate-500 text-[11px]">
                    {formatDateTime(t.createdAt)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

