// src/app/dashboard/orders/orders-table-client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
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
  SlidersHorizontal,
  X,
  Phone,
  ChevronDown,
  Check,
} from "lucide-react";
import { OrderReceiptModal } from "@/components/dashboard/order-receipt-modal";

interface OrdersTableClientProps {
  initialOrders: any[];
  storeSlug: string;
}

const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentStatusOptions = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  PENDING: { label: "Pending", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  CONFIRMED: { label: "Confirmed", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  PROCESSING: { label: "Processing", dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  SHIPPED: { label: "Shipped", dot: "bg-cyan-500", bg: "bg-cyan-50", text: "text-cyan-700" },
  DELIVERED: { label: "Delivered", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  CANCELLED: { label: "Cancelled", dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
};

const statusTabs = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function OrdersTableClient({ initialOrders, storeSlug }: OrdersTableClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [openStatusOrderId, setOpenStatusOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (openStatusOrderId) setOpenStatusOrderId(null);
    };
    if (openStatusOrderId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openStatusOrderId]);

  // Bulk and single order receipt state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptOrderIds, setReceiptOrderIds] = useState<string[]>([]);

  const hasActiveSecondaryFilters = channelFilter !== "ALL" || paymentFilter !== "ALL";

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      search.trim() === "" ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(search.toLowerCase()));

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </span>
        );
      case "ONLINE_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" />
            Online
          </span>
        );
      case "COD":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Banknote className="w-3 h-3" />
            COD
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls ── */}
      <div className="space-y-3">
        {/* Mobile Search Row + Filter Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer..."
              className="pl-10 pr-9 h-11 text-xs shadow-sm bg-white rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className={cn(
              "h-11 px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0",
              showMobileFilters || hasActiveSecondaryFilters
                ? "bg-blue-50 border-blue-300 text-[#2563EB]"
                : "bg-white border-slate-300 text-[#0F172A] hover:bg-slate-50"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveSecondaryFilters && (
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            )}
          </button>
        </div>

        {/* Desktop Search & Filters Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter order ID, customer, or email to search..."
              className="pl-10 shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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

        {/* Mobile Collapsible Secondary Filters Drawer */}
        {showMobileFilters && (
          <div className="sm:hidden p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in-0 duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
              <span className="text-xs font-bold text-[#0F172A]">Refine By</span>
              {hasActiveSecondaryFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setChannelFilter("ALL");
                    setPaymentFilter("ALL");
                  }}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Channel
                </label>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm"
                >
                  <option value="ALL">All Channels</option>
                  <option value="COD">COD</option>
                  <option value="ONLINE_PAYMENT">Online</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Payment
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm"
                >
                  <option value="ALL">All Payments</option>
                  {paymentStatusOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Status Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab.value).length;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border",
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                    : "bg-white text-[#64748B] border-slate-200/90 hover:text-[#0F172A] hover:border-slate-300 shadow-2xs"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bulk Printing Selection Bar ── */}
      {selectedIds.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm shadow-slate-200/50 animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Badge + Count + Deselect */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0F172A] truncate">
                    {selectedIds.length} {selectedIds.length === 1 ? "order" : "orders"} selected
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
                  <span className="text-[11px] text-[#64748B] hidden sm:inline-block">
                    A4 sheet ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] font-semibold text-[#2563EB] hover:text-blue-700 hover:underline cursor-pointer text-left block"
                >
                  Deselect all
                </button>
              </div>
            </div>

            {/* Right: Print Receipts Button */}
            <button
              type="button"
              onClick={() => handleOpenReceipts(selectedIds)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipts ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Orders Content ── */}
      {filteredOrders.length === 0 ? (
        <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-[#0F172A]">No orders found</h3>
            <p className="text-xs text-[#64748B]">
              {orders.length === 0
                ? "Your store has not received any orders yet."
                : "No orders matched your current filters."}
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* ── MOBILE VIEW: Interactive Order Cards ── */}
          <div className="md:hidden space-y-3">
            {/* Mobile Select-All row */}
            <div className="flex items-center justify-between px-1 text-xs">
              <label className="flex items-center gap-2 font-semibold text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer accent-[#2563EB]"
                />
                <span>Select all ({filteredOrders.length})</span>
              </label>
              <span className="text-[11px] text-[#64748B]">
                {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {/* Order Cards */}
            {filteredOrders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              const isExpanded = expandedIds.includes(order.id);

              return (
                <div
                  key={order.id}
                  className={cn(
                    "bg-white rounded-2xl border transition-all shadow-sm overflow-visible",
                    isSelected
                      ? "border-[#2563EB] ring-1 ring-[#2563EB]/20 bg-blue-50/10"
                      : "border-slate-200/90"
                  )}
                >
                  {/* Front Row (Collapsed): Checkbox, Name, Price, Dropdown Icon */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Checkbox + Customer Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center shrink-0"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer accent-[#2563EB]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                          {order.customer?.name || "Customer"}
                        </p>
                        <p className="font-mono text-[11px] text-[#2563EB] truncate mt-0.5">
                          #{order.orderNumber}
                        </p>
                      </div>
                    </div>

                    {/* Right: Price + Dropdown Icon */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-xs sm:text-sm text-[#0F172A] block">
                          {formatCurrency(Number(order.total))}
                        </span>
                        <span className="text-[10px] text-[#64748B] block">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(order.id);
                        }}
                        className={cn(
                          "w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 hover:bg-slate-200 cursor-pointer",
                          isExpanded && "rotate-180 bg-blue-50 text-[#2563EB]"
                        )}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Full Order Details + Proper UI Status Dropdown + PDF */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3 bg-slate-50/70 border-t border-slate-100 animate-in fade-in-50 duration-200">
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
                        {/* Header Row: Full Details Title + Channel Badge */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold text-[#0F172A]">Full Order Details</span>
                          <div className="shrink-0">
                            {renderChannelBadge(order.orderChannel || "COD")}
                          </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#64748B]">Customer</span>
                            <span className="font-semibold text-[#0F172A] text-right truncate">
                              {order.customer?.name || "Customer"}
                            </span>
                          </div>

                          {order.customer?.phone && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#64748B]">Phone</span>
                              <a
                                href={`tel:${order.customer.phone}`}
                                className="text-[#2563EB] font-semibold flex items-center gap-1 hover:underline text-right"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{order.customer.phone}</span>
                              </a>
                            </div>
                          )}

                          {order.customer?.email && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#64748B]">Email</span>
                              <span className="text-[#0F172A] font-medium text-right truncate">
                                {order.customer.email}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <span className="text-[#64748B]">Payment</span>
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
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#64748B]">Placed On</span>
                            <span className="text-slate-600 font-medium text-right text-[11px]">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions: Custom Status Dropdown with Proper UI + Receipt PDF */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          {/* Custom Status Dropdown */}
                          <div className="relative flex-1">
                            <button
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusOrderId(openStatusOrderId === order.id ? null : order.id);
                              }}
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-xs font-semibold text-[#0F172A] shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    STATUS_CONFIG[order.status]?.dot || "bg-slate-400"
                                  )}
                                />
                                <span className="truncate">
                                  {updatingId === order.id
                                    ? "Updating..."
                                    : `Status: ${STATUS_CONFIG[order.status]?.label || order.status}`}
                                </span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 text-[#64748B] shrink-0 ml-1.5 transition-transform duration-200",
                                  openStatusOrderId === order.id && "rotate-180 text-[#2563EB]"
                                )}
                              />
                            </button>

                            {/* Floating Status Menu */}
                            {openStatusOrderId === order.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 p-1.5 animate-in fade-in-0 zoom-in-95 space-y-0.5"
                              >
                                <div className="text-[10px] font-bold text-[#94A3B8] px-2.5 py-1 uppercase tracking-wider">
                                  Select Status
                                </div>
                                {statusOptions.map((s) => {
                                  const isSelected = order.status === s;
                                  const cfg = STATUS_CONFIG[s];
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => {
                                        handleStatusChange(order.id, s);
                                        setOpenStatusOrderId(null);
                                      }}
                                      className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer",
                                        isSelected
                                          ? "bg-blue-50 text-[#2563EB] font-bold"
                                          : "text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={cn("w-2 h-2 rounded-full shrink-0", cfg?.dot || "bg-slate-400")} />
                                        <span>{cfg?.label || s}</span>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Receipt PDF Download / Print Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReceipts([order.id]);
                            }}
                            className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold border border-blue-200/80 transition-colors shadow-2xs shrink-0 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP VIEW: Full Data Table ── */}
          <div className="hidden md:block">
            <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
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
            </Card>
          </div>
        </>
      )}

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
