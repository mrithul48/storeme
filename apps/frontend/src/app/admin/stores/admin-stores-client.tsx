"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Store, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";

interface StoreItem {
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
    plan?: {
      name: string;
      price: any;
    } | null;
    status: string;
  } | null;
  _count: {
    products: number;
    orders: number;
  };
}

export function AdminStoresClient({ initialStores }: { initialStores: StoreItem[] }) {
  const router = useRouter();
  const [stores, setStores] = useState(initialStores);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = stores.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.owner.name && s.owner.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (store: StoreItem) => {
    const nextStatus = store.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "SUSPENDED"
        ? `Are you sure you want to SUSPEND "${store.name}"? Storefront visitors will not be able to view or purchase.`
        : `Are you sure you want to RE-ACTIVATE "${store.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(store.id);

    try {
      const res = await fetch(`/api/admin/stores/${store.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s))
        );
        router.refresh();
      } else {
        alert("Failed to update store status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating store status.");
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Store Statuses</option>
          <option value="ACTIVE">Active Stores</option>
          <option value="SUSPENDED">Suspended Stores</option>
        </select>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Store className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-200">No stores found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Store Name & Slug</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Catalog & Orders</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{s.name}</p>
                      <Link
                        href={`/store/${s.slug}`}
                        target="_blank"
                        className="text-xs text-blue-400 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                      >
                        /{s.slug}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">{s.owner.name || "—"}</p>
                      <p className="text-xs text-slate-400">{s.owner.email}</p>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span className="font-semibold text-slate-200">
                        {s.subscription?.plan?.name || "Growth Plan"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div>{s._count.products} products</div>
                      <div className="text-slate-400">{s._count.orders} orders</div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={s.status === "ACTIVE" ? "success" : "danger"}>
                        {s.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDateTime(s.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant={s.status === "ACTIVE" ? "danger" : "secondary"}
                        size="sm"
                        isLoading={updatingId === s.id}
                        onClick={() => handleToggleStatus(s)}
                      >
                        {s.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
