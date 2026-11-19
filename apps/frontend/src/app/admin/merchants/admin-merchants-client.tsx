"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  Store,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Package,
  ShoppingBag,
} from "lucide-react";

export interface MerchantItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string | Date;
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
  subscription?: {
    id: string;
    status: string;
    billingPeriod?: string;
    plan?: {
      name: string;
      price: number;
    } | null;
  } | null;
  _count: {
    products: number;
    orders: number;
  };
}

export function AdminMerchantsClient({
  initialMerchants,
}: {
  initialMerchants: MerchantItem[];
}) {
  const router = useRouter();
  const [merchants, setMerchants] = useState(initialMerchants);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = merchants.filter((m) => {
    const matchesSearch =
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      m.owner.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.owner.name && m.owner.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (merchant: MerchantItem) => {
    const nextStatus = merchant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const promptReason =
      nextStatus === "SUSPENDED"
        ? window.prompt(`Reason for suspending merchant "${merchant.name}":`, "Violation of Terms")
        : null;

    if (nextStatus === "SUSPENDED" && promptReason === null) return; // user cancelled

    setUpdatingId(merchant.id);

    try {
      const res = await fetch(`/api/admin/merchants/${merchant.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          reason: promptReason || undefined,
        }),
      });

      if (res.ok) {
        setMerchants((prev) =>
          prev.map((m) =>
            m.id === merchant.id ? { ...m, status: nextStatus } : m
          )
        );
        router.refresh();
      } else {
        alert("Failed to update merchant status.");
      }
    } catch (err) {
      console.error("Merchant status update error:", err);
      alert("Error updating merchant status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, slug, or owner email..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "SUSPENDED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-xs"
            >
              {status === "ALL" ? "All Merchants" : status}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Store & Merchant</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((m) => {
                const isSuspended = m.status === "SUSPENDED";
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-white text-sm">
                          {m.name}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          /{m.slug}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200">
                        {m.owner?.name || "Merchant"}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {m.owner?.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">
                          {m.subscription?.plan?.name || "Growth Plan"}
                        </span>
                        {m.subscription?.billingPeriod && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {m.subscription.billingPeriod}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          {m._count.products} products
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                          {m._count.orders} orders
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="p-4">
                      <Badge variant={isSuspended ? "danger" : "success"}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                        <Button
                          variant={isSuspended ? "secondary" : "danger"}
                          size="sm"
                          disabled={updatingId === m.id}
                          onClick={() => handleToggleStatus(m)}
                          className="text-xs"
                        >
                          {isSuspended ? "Reactivate" : "Suspend"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No merchants match the selected filters.
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

