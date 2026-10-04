"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, ExternalLink, MessageCircle, CreditCard, Banknote } from "lucide-react";

interface OrdersTableClientProps {
  initialOrders: any[];
  storeSlug: string;
}

const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentStatusOptions = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export function OrdersTableClient({ initialOrders, storeSlug }: OrdersTableClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      search.trim() === "" ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;
    const matchesChannel = channelFilter === "ALL" || o.orderChannel === channelFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesChannel;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        router.refresh();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Order status update error:", err);
      alert("Error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search #, customer, email..."
            className="pl-10"
          />
        </div>

        {/* Channel Filter */}
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

        {/* Order Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Order Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Payment Status Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Payment Statuses</option>
          {paymentStatusOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-0 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-200">No orders found</h3>
            <p className="text-xs text-slate-400">
              {orders.length === 0
                ? "Your store has not received any orders yet."
                : "No orders matched your current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status & Update</th>
                  <th className="px-6 py-4">Placed On</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-400">
                      #{order.orderNumber}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-200">{order.customer?.name || "Customer"}</p>
                      <p className="text-xs text-slate-400">{order.customer?.email}</p>
                      {order.customer?.phone && (
                        <p className="text-xs text-slate-500">{order.customer.phone}</p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {renderChannelBadge(order.orderChannel || "COD")}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {order.itemCount} items
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(Number(order.total))}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "FAILED" ? "danger" : "warning"}>
                        {order.paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/store/${storeSlug}/orders/${order.orderNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="w-3 h-3" />
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
