"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Mail, Phone, ShoppingBag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface OrderCustomer {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface MobileOrderItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  orderChannel?: string | null;
  paymentMethod?: string | null;
  total: number | string;
  createdAt: string | Date;
  itemCount: number;
  customer: OrderCustomer;
}

interface RecentOrdersMobileProps {
  orders: MobileOrderItem[];
  statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral">;
}

export function RecentOrdersMobile({ orders, statusVariantMap }: RecentOrdersMobileProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 text-center space-y-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-semibold text-[#0F172A]">No orders yet</p>
        <p className="text-xs text-[#64748B]">Share your store link with customers to start receiving orders!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;

        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
          >
            {/* Front Side: Customer Name, Date, Price, and Down Arrow mark */}
            <button
              type="button"
              onClick={() => toggleExpand(order.id)}
              className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none transition-all cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-[#0F172A] truncate block">
                  {order.customer.name || "Customer"}
                </span>
                <span className="text-xs text-[#64748B] block mt-0.5">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-bold text-sm text-[#0F172A]">
                  {formatCurrency(Number(order.total))}
                </span>
                <div
                  className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 ${
                    isExpanded ? "rotate-180 bg-blue-50 text-[#2563EB]" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Click to Show Full Details Properly */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 space-y-3 bg-slate-50/70 border-t border-slate-100 animate-in fade-in-50 duration-200">
                {/* Order Meta Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-[#2563EB]">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                    <Badge variant={statusVariantMap[order.status] || "neutral"}>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Customer Details Box */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] border-b border-slate-100 pb-2">
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Customer Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B] shrink-0">Full Name</span>
                      <span className="font-semibold text-[#0F172A] text-right truncate">
                        {order.customer.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B] flex items-center gap-1 shrink-0">
                        <Mail className="w-3 h-3 text-slate-400" />
                        Email
                      </span>
                      <span className="font-medium text-[#0F172A] text-right truncate">
                        {order.customer.email ? (
                          <a
                            href={`mailto:${order.customer.email}`}
                            className="text-[#2563EB] hover:underline"
                          >
                            {order.customer.email}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#64748B] flex items-center gap-1 shrink-0">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Phone
                      </span>
                      <span className="font-medium text-[#0F172A] text-right truncate">
                        {order.customer.phone ? (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="text-[#2563EB] hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>

                    {order.paymentMethod && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[#64748B]">Payment Method</span>
                        <span className="font-semibold text-[#0F172A] uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Order Link Button */}
                <div className="pt-1">
                  <Link
                    href={`/dashboard/orders?search=${order.orderNumber}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 shadow-xs transition-colors"
                  >
                    <span>View Full Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
