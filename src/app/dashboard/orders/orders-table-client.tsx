// src/app/dashboard/orders/orders-table-client.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Banknote,
  Printer,
  FileCheck,
} from "lucide-react";
import { OrderReceiptModal } from "@/components/dashboard/order-receipt-modal";

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

  // Bulk and single order receipt state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptOrderIds, setReceiptOrderIds] = useState<string[]>([]);

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

  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleOpenReceipts = (ids: string[]) => {
    if (ids.length === 0) return;
    setReceiptOrderIds(ids);
    setReceiptModalOpen(true);
  };

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </span>
        );
      case "ONLINE_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" />
            Online
          </span>
        );
      case "COD":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter order ID, customer, or email to search..."
            className="pl-10 shadow-sm"
          />
        </div>

        {/* Channel Filter */}
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
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
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
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
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
        >
          <option value="ALL">All Payment Statuses</option>
          {paymentStatusOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Printing Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-[#0F172A] shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                {selectedIds.length} {selectedIds.length === 1 ? "order" : "orders"} selected for bulk action
              </p>
              <p className="text-[11px] text-[#64748B]">
                Generates combined A4 sheet(s) formatted with 4 receipts per page
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenReceipts(selectedIds)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Receipts ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-[#0F172A]">No orders found</h3>
            <p className="text-xs text-[#64748B]">
              {orders.length === 0
                ? "Your store has not received any orders yet."
                : "No orders matched your current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase border-b border-slate-200">
                <tr>
                  <th className="w-10 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer accent-[#2563EB]"
                      title={isAllSelected ? "Deselect all" : "Select all orders"}
                    />
                  </th>
                  <th className="px-5 py-4">Order #</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status & Update</th>
                  <th className="px-5 py-4">Placed On</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors ${
                      selectedIds.includes(order.id)
                        ? "bg-blue-50/50 hover:bg-blue-50/70"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="w-10 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleToggleSelect(order.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer accent-[#2563EB]"
                      />
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-[#2563EB]">
                      #{order.orderNumber}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{order.customer?.name || "Customer"}</p>
                      <p className="text-xs text-[#64748B]">{order.customer?.email}</p>
                      {order.customer?.phone && (
                        <p className="text-xs text-slate-400">{order.customer.phone}</p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {renderChannelBadge(order.orderChannel || "COD")}
                    </td>

                    <td className="px-5 py-4 text-[#64748B]">
                      {order.itemCount} items
                    </td>

                    <td className="px-5 py-4 font-bold text-[#0F172A]">
                      {formatCurrency(Number(order.total))}
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          order.paymentStatus === "PAID"
                            ? "success"
                            : order.paymentStatus === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm disabled:opacity-50"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#64748B]">
                      {formatDateTime(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipts([order.id])}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] transition-colors text-xs font-semibold border border-blue-200/80 shadow-xs cursor-pointer whitespace-nowrap flex-nowrap"
                        title="Generate and Download PDF Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">Receipt PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Receipt Modal (Single & Bulk A4 4-Per-Page PDF) */}
      <OrderReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        orderIds={receiptOrderIds}
        storeSlug={storeSlug}
      />
    </div>
  );
}
