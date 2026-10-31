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
      <div className="py-8 text-center space-y-2 bg-[#101A3D] rounded-2xl border border-[#202D55] shadow-sm p-4">
        <ShoppingBag className="w-8 h-8 text-[#7181A8]/50 mx-auto" />
        <p className="text-sm font-semibold text-[#F5F7FF]">No orders yet</p>
        <p className="text-xs text-[#7181A8]">Share your store link with customers to start receiving orders!</p>
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
            className="bg-[#101A3D] rounded-2xl border border-[#202D55] shadow-sm overflow-hidden transition-all"
          >
            {/* Front Side: Customer Name, Date, Price, and Down Arrow mark */}
            <button
              type="button"
              onClick={() => toggleExpand(order.id)}
              className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none transition-all cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-[#F5F7FF] truncate block">
                  {order.customer.name || "Customer"}
                </span>
                <span className="text-xs text-[#7181A8] block mt-0.5">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-bold text-sm text-[#F5F7FF]">
                  {formatCurrency(Number(order.total))}
                </span>
                <div
                  className={`w-7 h-7 rounded-full bg-[#172653] border border-[#202D55] flex items-center justify-center text-[#A5B2D1] transition-transform duration-200 ${
                    isExpanded ? "rotate-180 bg-[#4169E1] text-white border-[#4169E1]" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Click to Show Full Details Properly */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 space-y-3 bg-[#0A1030] border-t border-[#172347] animate-in fade-in-50 duration-200">
                {/* Order Meta Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-[#638BFF]">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                    <Badge variant={statusVariantMap[order.status] || "neutral"}>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-[#7181A8] font-medium">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Customer Details Box */}
                <div className="bg-[#080D28] rounded-xl p-3.5 border border-[#202D55] shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FF] border-b border-[#172347] pb-2">
                    <User className="w-3.5 h-3.5 text-[#638BFF]" />
                    <span>Customer Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7181A8] shrink-0">Full Name</span>
                      <span className="font-semibold text-[#F5F7FF] text-right truncate">
                        {order.customer.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7181A8] flex items-center gap-1 shrink-0">
                        <Mail className="w-3 h-3 text-[#7181A8]" />
                        Email
                      </span>
                      <span className="font-medium text-[#F5F7FF] text-right truncate">
                        {order.customer.email ? (
                          <a
                            href={`mailto:${order.customer.email}`}
                            className="text-[#638BFF] hover:underline"
                          >
                            {order.customer.email}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7181A8] flex items-center gap-1 shrink-0">
                        <Phone className="w-3 h-3 text-[#7181A8]" />
                        Phone
                      </span>
                      <span className="font-medium text-[#F5F7FF] text-right truncate">
                        {order.customer.phone ? (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="text-[#638BFF] hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Link Button */}
                <Link
                  href={`/dashboard/orders`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#172653] hover:bg-[#1C3066] border border-[#202D55] text-xs font-semibold text-[#638BFF] transition-all"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
