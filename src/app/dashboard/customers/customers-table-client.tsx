"use client";

import React, { useState } from "react";
import { formatCurrency, formatDateTime, buildWhatsAppUrl } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <p className="text-2xl font-black text-white">{customers.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">Registered buyers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Repeat Buyers
            </span>
            <p className="text-2xl font-black text-white">{repeatCustomers}</p>
            <p className="text-[11px] text-emerald-400 font-medium">2+ orders placed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Customer Value
            </span>
            <p className="text-2xl font-black text-white">
              {formatCurrency(totalSpentAll)}
            </p>
            <p className="text-[11px] text-purple-400 font-medium">Lifetime revenue</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email address or phone..."
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      <Card className="p-0 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-200">No customers found</h3>
            <p className="text-xs text-slate-400">
              {customers.length === 0
                ? "Customers will automatically be listed here as soon as they place their first order."
                : "No customers matched your search query."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Orders Placed</th>
                  <th className="px-6 py-4">Lifetime Spend</th>
                  <th className="px-6 py-4">Last Order</th>
                  <th className="px-6 py-4 text-right">Direct Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
                          {customer.name[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{customer.name}</p>
                          <p className="text-xs text-slate-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={customer.totalOrders > 1 ? "purple" : "neutral"}>
                        {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
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
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <a
                          href={`mailto:${customer.email}`}
                          title="Send Email"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Mail className="w-4 h-4" />
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
