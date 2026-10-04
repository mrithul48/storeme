"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, ExternalLink, MessageCircle, CreditCard, Banknote } from "lucide-react";

interface AdminOrder {
  id: string;
  orderNumber: string;
  total: any;
  status: string;
  paymentStatus: string;
  orderChannel: string;
  createdAt: string | Date;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  customer?: {
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  _count: {
    items: number;
  };
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      search.trim() === "" ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.store.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (o.customer?.email && o.customer.email.toLowerCase().includes(search.toLowerCase()));

    const matchesChannel = channelFilter === "ALL" || o.orderChannel === channelFilter;
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const renderChannelBadge = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </span>
        );
      case "ONLINE_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CreditCard className="w-3 h-3" />
            Online
          </span>
        );
      case "COD":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Banknote className="w-3 h-3" />
            COD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search #, store name, or customer..."
            className="pl-10"
          />
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Order Channels</option>
          <option value="COD">Cash on Delivery (COD)</option>
          <option value="ONLINE_PAYMENT">Online Payment</option>
          <option value="WHATSAPP">WhatsApp Order</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-200">No orders found</h3>
            <p className="text-xs text-slate-400">No cross-tenant orders match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-400">
                      #{o.orderNumber}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{o.store.name}</span>
                      <span className="text-xs text-slate-500 block font-mono">/{o.store.slug}</span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">{o.customer?.name || "Customer"}</p>
                      <p className="text-xs text-slate-400">{o.customer?.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      {renderChannelBadge(o.orderChannel || "COD")}
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(Number(o.total))}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={o.paymentStatus === "PAID" ? "success" : "warning"}>
                        {o.paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-300">{o.status}</span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDateTime(o.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/store/${o.store.slug}/orders/${o.orderNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
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
