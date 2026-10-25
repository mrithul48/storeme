// src/components/dashboard/order-receipt-modal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  generateReceiptsPDF,
  ReceiptOrder,
  ReceiptStoreInfo,
} from "@/lib/order-receipt-pdf";
import {
  Printer,
  Download,
  X,
  Loader2,
  FileText,
  Scissors,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderIds: string[];
  storeSlug: string;
}

export function OrderReceiptModal({
  isOpen,
  onClose,
  orderIds,
  storeSlug,
}: OrderReceiptModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ReceiptOrder[]>([]);
  const [store, setStore] = useState<ReceiptStoreInfo | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen || orderIds.length === 0) return;

    const fetchReceiptData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load receipt details");
        }

        setOrders(data.orders || []);
        setStore(data.store || null);
      } catch (err: any) {
        console.error("Receipt fetch error:", err);
        setError(err.message || "Failed to load receipt data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [isOpen, orderIds]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(orders.length / 4);

  // Chunk orders into groups of 4 for A4 pages
  const pages: ReceiptOrder[][] = [];
  for (let i = 0; i < orders.length; i += 4) {
    pages.push(orders.slice(i, i + 4));
  }

  const handleDownloadPdf = () => {
    if (!store || orders.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const doc = generateReceiptsPDF(orders, store);
      const filename =
        orders.length === 1
          ? `Receipt-${orders[0].orderNumber}.pdf`
          : `Orders-Receipts-Bulk-${orders.length}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try the Print option.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100/70 text-[#2563EB]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                {orders.length === 1 ? "Order Receipt" : "Bulk Order Receipts"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {loading
                  ? "Loading order details..."
                  : `${orders.length} order(s) · ${totalPages} A4 page(s) (4 receipts per page)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={loading || orders.length === 0 || isGeneratingPdf}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1.5 text-[#2563EB]" />
              )}
              Download PDF
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              disabled={loading || orders.length === 0}
              className="bg-[#2563EB] hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print (A4)
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
              <p className="text-sm font-medium">Preparing A4 receipt layout...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-rose-600">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-semibold">{error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500">
              <FileText className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-medium">No order details found.</p>
            </div>
          ) : (
            <div id="print-receipts-container" className="space-y-8 max-w-4xl mx-auto">
              {pages.map((pageOrders, pageIdx) => (
                <div
                  key={`page-${pageIdx}`}
                  className="receipt-page bg-white rounded-xl shadow-lg border border-slate-300 p-4 sm:p-6 relative aspect-[1/1.414] min-h-[720px] flex flex-col justify-between"
                  style={{
                    pageBreakAfter: pageIdx < pages.length - 1 ? "always" : "auto",
                  }}
                >
                  {/* Page header tag */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-2 border-b border-slate-200/80 no-print">
                    <span>
                      Sheet {pageIdx + 1} of {totalPages} (A4 Standard)
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5" /> 4 Receipts Grid · Cut along guides
                    </span>
                  </div>

                  {/* 2x2 Grid of 4 Receipts */}
                  <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 flex-1 py-2 relative">
                    {/* Visual Cut Guides */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300 flex items-center justify-center pointer-events-none z-10">
                      <span className="bg-white px-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <Scissors className="w-3 h-3" /> Cut Here
                      </span>
                    </div>
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-300 flex items-center justify-center pointer-events-none z-10">
                      <span className="bg-white py-1 px-1 text-[10px] text-slate-400 -rotate-90">
                        Cut Here
                      </span>
                    </div>

                    {pageOrders.map((order) => {
                      const shipping = order.shippingAddress as Record<string, string> | null;
                      const hasAddress =
                        shipping &&
                        (shipping.address || shipping.city || shipping.state || shipping.pincode);

                      return (
                        <div
                          key={order.id}
                          className="receipt-card border border-slate-300 rounded-lg p-3 bg-white flex flex-col justify-between text-[11px] leading-tight relative shadow-xs"
                        >
                          {/* Top Section */}
                          <div className="space-y-1.5">
                            {/* Business Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
                              <div>
                                <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-tight">
                                  {store?.name || "STORE"}
                                </h3>
                                {store?.company?.phone && (
                                  <p className="text-[10px] text-slate-500">
                                    Ph: {store.company.phone}
                                  </p>
                                )}
                                {store?.company?.address && (
                                  <p className="text-[9.5px] text-slate-500 line-clamp-1">
                                    {store.company.address}
                                  </p>
                                )}
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                                RECEIPT
                              </span>
                            </div>

                            {/* Order & Customer Details */}
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase">
                                  Order Number
                                </span>
                                <span className="font-bold text-slate-900 font-mono">
                                  #{order.orderNumber}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 block text-[9px] uppercase">
                                  Date
                                </span>
                                <span className="text-slate-700">
                                  {formatDateTime(order.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="bg-slate-50/80 p-1.5 rounded border border-slate-100 text-[10px]">
                              <p className="font-semibold text-slate-900">
                                {order.customer?.name || "Customer"}
                                {order.customer?.phone && (
                                  <span className="font-normal text-slate-600">
                                    {" "}
                                    · {order.customer.phone}
                                  </span>
                                )}
                              </p>
                              {order.customer?.email && (
                                <p className="text-slate-500 text-[9.5px] truncate">
                                  {order.customer.email}
                                </p>
                              )}
                              {hasAddress && (
                                <p className="text-slate-600 text-[9.5px] mt-0.5 line-clamp-1">
                                  {[
                                    shipping?.address,
                                    shipping?.city,
                                    shipping?.state,
                                    shipping?.pincode,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>

                            {/* Channel & Payment Info */}
                            <div className="flex items-center justify-between text-[9.5px] text-slate-600">
                              <span>
                                Channel: <strong>{order.orderChannel || "COD"}</strong>
                              </span>
                              <span>
                                Payment:{" "}
                                <strong
                                  className={
                                    order.paymentStatus === "PAID"
                                      ? "text-emerald-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {order.paymentStatus || "PENDING"}
                                </strong>
                              </span>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-200 rounded overflow-hidden">
                              <table className="w-full text-left text-[9.5px]">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                  <tr>
                                    <th className="p-1">Item</th>
                                    <th className="p-1 text-center">Qty</th>
                                    <th className="p-1 text-right">Price</th>
                                    <th className="p-1 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {order.items.slice(0, 3).map((item) => (
                                    <tr key={item.id}>
                                      <td className="p-1 max-w-[120px] truncate text-slate-800">
                                        {item.productName}
                                        {item.variantColor && (
                                          <span className="text-slate-500 text-[8.5px]">
                                            {" "}
                                            ({item.variantColor})
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-1 text-center text-slate-600">
                                        {item.quantity}
                                      </td>
                                      <td className="p-1 text-right text-slate-600">
                                        {formatCurrency(item.price)}
                                      </td>
                                      <td className="p-1 text-right font-medium text-slate-900">
                                        {formatCurrency(item.subtotal)}
                                      </td>
                                    </tr>
                                  ))}
                                  {order.items.length > 3 && (
                                    <tr>
                                      <td
                                        colSpan={4}
                                        className="p-0.5 text-center text-[8.5px] italic text-slate-400"
                                      >
                                        + {order.items.length - 3} more item(s)...
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Bottom Total Summary */}
                          <div className="pt-1.5 border-t border-slate-100 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Subtotal:</span>
                              <span className="text-slate-800 font-medium">
                                {formatCurrency(order.subtotal || order.total)}
                              </span>
                            </div>
                            {(((order as any).shippingCharge !== undefined && (order as any).shippingCharge > 0) ||
                            (order.total > (order.subtotal || 0) && order.subtotal > 0)) && (
                              <div className="flex justify-between text-[9.5px] text-slate-500">
                                <span>Delivery Charges:</span>
                                <span className="text-slate-800 font-medium">
                                  {formatCurrency(
                                    (order as any).shippingCharge !== undefined && (order as any).shippingCharge > 0
                                      ? (order as any).shippingCharge
                                      : order.total - order.subtotal
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-1 rounded bg-blue-50/70 border border-blue-100 text-xs font-bold text-[#2563EB]">
                              <span>Total Amount:</span>
                              <span className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                            <p className="text-[8.5px] text-slate-400 text-center pt-0.5">
                              Thank you for your order!
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Fill empty quadrants if less than 4 on the page */}
                    {Array.from({ length: 4 - pageOrders.length }).map((_, emptyIdx) => (
                      <div
                        key={`empty-${emptyIdx}`}
                        className="border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs no-print"
                      >
                        Empty Slot (A4 Quadrant)
                      </div>
                    ))}
                  </div>

                  {/* Page Footer */}
                  <div className="text-center text-[9px] text-slate-400 pt-1 border-t border-slate-200/80">
                    A4 Receipt Grid · Page {pageIdx + 1} of {totalPages}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Print Styles for A4 4-Receipts Grid */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipts-container,
          #print-receipts-container * {
            visibility: visible;
          }
          #print-receipts-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .receipt-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 8mm !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .receipt-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
