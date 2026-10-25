"use client";

import React, { useState } from "react";
import { formatCurrency, formatDateTime, buildWhatsAppUrl } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageCircle, Mail, IndianRupee, ShoppingBag } from "lucide-react";

interface CustomersTableClientProps {
  initialCustomers: any[];
}

export function CustomersTableClient({ initialCustomers }: CustomersTableClientProps) {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      term === "" ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Customers
            </span>
            <p className="text-2xl font-black text-[#0F172A]">{customers.length}</p>
            <p className="text-[11px] text-[#64748B] font-medium">Registered buyers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Repeat Buyers
            </span>
            <p className="text-2xl font-black text-[#0F172A]">{repeatCustomers}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">2+ orders placed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Customer Value
            </span>
            <p className="text-2xl font-black text-[#0F172A]">
              {formatCurrency(totalSpentAll)}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold">Lifetime revenue</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter customer name, email address, or phone to search..."
          className="pl-10 shadow-sm"
        />
      </div>

      {/* Customers Table */}
      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-[#0F172A]">No customers found</h3>
            <p className="text-xs text-[#64748B]">
              {customers.length === 0
                ? "Customers will automatically be listed here as soon as they place their first order."
                : "No customers matched your search query."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Orders Placed</th>
                  <th className="px-6 py-4">Lifetime Spend</th>
                  <th className="px-6 py-4">Last Order</th>
                  <th className="px-6 py-4 text-right">Direct Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-[#2563EB]">
                          {customer.name[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{customer.name}</p>
                          <p className="text-xs text-[#64748B]">{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-[#0F172A]">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={customer.totalOrders > 1 ? "purple" : "neutral"}>
                        {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 font-bold text-[#0F172A]">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {customer.lastOrderDate ? formatDateTime(customer.lastOrderDate) : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {customer.phone && (
                          <a
                            href={buildWhatsAppUrl(
                              customer.phone,
                              `Hello ${customer.name}, thank you for ordering from our store!`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Message on WhatsApp"
                            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <a
                          href={`mailto:${customer.email}`}
                          title="Send Email"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/90 text-[#0F172A] transition-colors border border-slate-200"
                        >
                          <Mail className="w-4 h-4 text-[#2563EB]" />
                        </a>
                      </div>
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
