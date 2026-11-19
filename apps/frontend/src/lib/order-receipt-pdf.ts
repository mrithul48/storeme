// src/lib/order-receipt-pdf.ts
// Generates A4 PDF with 4 order receipts per page using jsPDF

import { jsPDF } from "jspdf";

export interface ReceiptStoreInfo {
  name: string;
  slug?: string;
  company?: {
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    businessType?: string | null;
  } | null;
}

export interface ReceiptOrderItem {
  id: string;
  productName: string;
  productSku?: string | null;
  variantColor?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ReceiptOrder {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  orderChannel: string;
  subtotal: number;
  shippingCharge?: number | null;
  total: number;
  notes?: string | null;
  shippingAddress?: any;
  customer?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: ReceiptOrderItem[];
}

function formatINR(amount: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatReceiptDate(date: string | Date): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return String(date);
  }
}

/**
 * Renders a single receipt into a quadrant of an A4 page
 */
function drawReceiptQuadrant(
  doc: jsPDF,
  order: ReceiptOrder,
  store: ReceiptStoreInfo,
  startX: number,
  startY: number,
  width: number,
  height: number
) {
  // 1. Draw outer receipt container border with rounded corners
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(startX, startY, width, height, 1.5, 1.5);

  const pad = 3.5;
  const contentX = startX + pad;
  const contentW = width - pad * 2;
  let currY = startY + 5;

  // 2. Header: Business Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  const storeName = (store.name || "STORE").toUpperCase();
  doc.text(storeName.slice(0, 32), contentX, currY);

  // Badge: RECEIPT
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("ORDER RECEIPT", startX + width - pad - 23, currY);

  currY += 3.8;

  // Store contact/address if available (safely without hardcoding)
  const storeDetails: string[] = [];
  if (store.company?.phone) storeDetails.push(`Ph: ${store.company.phone}`);
  if (store.company?.email) storeDetails.push(store.company.email);
  if (store.company?.address) storeDetails.push(store.company.address);

  if (storeDetails.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // slate-500
    const detailLine = storeDetails.join(" | ");
    doc.text(detailLine.slice(0, 68), contentX, currY);
    currY += 3.2;
  }

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(contentX, currY, contentX + contentW, currY);
  currY += 3.5;

  // 3. Order Meta & Customer Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Order: #${order.orderNumber}`, contentX, currY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const dateStr = formatReceiptDate(order.createdAt);
  doc.text(dateStr, startX + width - pad, currY, { align: "right" });
  currY += 3.5;

  // Customer line - unified single call with proper spacing to prevent any overlap
  if (order.customer?.name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const phonePart = order.customer.phone ? `   |   Ph: ${order.customer.phone}` : "";
    doc.text(`Customer: ${order.customer.name}${phonePart}`, contentX, currY);
    currY += 3.3;
  }

  // Shipping Address if available
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    const parts = [addr.address, addr.city, addr.state, addr.pincode].filter(Boolean);
    if (parts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      const addrLine = `Ship To: ${parts.join(", ")}`;
      doc.text(addrLine.slice(0, 68), contentX, currY);
      currY += 3.2;
    }
  }

  // Channel & Payment Status Badges
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  const paymentMethodText = order.paymentMethod ? `Method: ${order.paymentMethod}` : "";
  const paymentStatusText = `Payment: ${order.paymentStatus || "PENDING"}`;
  const channelText = `Channel: ${order.orderChannel || "Online"}`;
  doc.text([channelText, paymentMethodText, paymentStatusText].filter(Boolean).join("  |  "), contentX, currY);
  currY += 3.5;

  // 4. Items Table Header
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(contentX, currY, contentW, 4.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const colItemX = contentX + 1.5;
  const colQtyX = contentX + 48;
  const colPriceX = contentX + 63;
  const colTotalX = contentX + contentW - 1.5;

  doc.text("ITEM", colItemX, currY + 3.2);
  doc.text("QTY", colQtyX, currY + 3.2, { align: "right" });
  doc.text("PRICE", colPriceX, currY + 3.2, { align: "right" });
  doc.text("TOTAL", colTotalX, currY + 3.2, { align: "right" });
  currY += 5;

  // Items List (accommodate up to 5 items cleanly, with overflow counter)
  const items = order.items || [];
  const maxDisplayItems = 4;
  const displayItems = items.slice(0, maxDisplayItems);
  const remainingCount = items.length - maxDisplayItems;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);

  displayItems.forEach((item) => {
    doc.setTextColor(15, 23, 42);
    let name = item.productName || "Product";
    if (item.variantColor) name += ` (${item.variantColor})`;
    if (name.length > 28) name = name.slice(0, 26) + "...";

    doc.text(name, colItemX, currY + 3);
    doc.text(String(item.quantity || 1), colQtyX, currY + 3, { align: "right" });
    doc.text(formatINR(item.price), colPriceX, currY + 3, { align: "right" });
    doc.text(formatINR(item.subtotal), colTotalX, currY + 3, { align: "right" });
    currY += 4.2;
  });

  if (remainingCount > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(`+ ${remainingCount} more item(s)...`, colItemX, currY + 2.5);
    currY += 3.8;
  }

  // 5. Financial Summary Box (Pinned towards bottom)
  const summaryBoxY = startY + height - 26;
  doc.setDrawColor(226, 232, 240);
  doc.line(contentX, summaryBoxY, contentX + contentW, summaryBoxY);

  let sumY = summaryBoxY + 3.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", contentX + 38, sumY);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(order.subtotal || order.total), colTotalX, sumY, { align: "right" });
  sumY += 3.4;

  // Delivery charges if applied
  const deliveryCharge =
    order.shippingCharge !== undefined && order.shippingCharge !== null
      ? Number(order.shippingCharge)
      : order.total > (order.subtotal || 0) && order.subtotal > 0
      ? order.total - order.subtotal
      : 0;

  if (deliveryCharge > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Delivery Charges:", contentX + 38, sumY);
    doc.setTextColor(15, 23, 42);
    doc.text(formatINR(deliveryCharge), colTotalX, sumY, { align: "right" });
    sumY += 3.4;
  }

  // Grand Total Highlight Bar
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(contentX, sumY, contentW, 6.2, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("TOTAL AMOUNT", contentX + 2, sumY + 4.3);
  doc.text(formatINR(order.total), colTotalX - 1, sumY + 4.3, { align: "right" });

  // Cut separator indicator at bottom
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Original Receipt - Thank you for shopping with us", contentX, startY + height - 1.5);
}

/**
 * Generates an A4 PDF containing 4 receipts per page
 */
export function generateReceiptsPDF(
  orders: ReceiptOrder[],
  store: ReceiptStoreInfo
): jsPDF {
  // A4 portrait: 210 x 297 mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Layout parameters for 4 receipts per page (2 columns x 2 rows)
  const marginX = 8;
  const marginY = 8;
  const colGap = 6;
  const rowGap = 7;
  const receiptWidth = (pageWidth - marginX * 2 - colGap) / 2; // ~94mm
  const receiptHeight = (pageHeight - marginY * 2 - rowGap) / 2; // ~137mm

  const quadrants = [
    { x: marginX, y: marginY }, // Top-Left
    { x: marginX + receiptWidth + colGap, y: marginY }, // Top-Right
    { x: marginX, y: marginY + receiptHeight + rowGap }, // Bottom-Left
    { x: marginX + receiptWidth + colGap, y: marginY + receiptHeight + rowGap }, // Bottom-Right
  ];

  const totalPages = Math.ceil(orders.length / 4);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage();
    }

    // Draw central cutting guidelines (dashed lines across page center)
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 3], 0);
    doc.setLineWidth(0.2);

    // Horizontal cut line at center height
    const centerY = pageHeight / 2;
    doc.line(marginX / 2, centerY, pageWidth - marginX / 2, centerY);

    // Vertical cut line at center width
    const centerX = pageWidth / 2;
    doc.line(centerX, marginY / 2, centerX, pageHeight - marginY / 2);

    // Reset line dash pattern for receipt borders
    doc.setLineDashPattern([], 0);

    // Cut icons / scissors markers
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("✂ Cut Here", centerX - 6, 5);
    doc.text("✂ Cut Here", 2, centerY - 1);

    // Draw up to 4 orders on this page
    const pageOrders = orders.slice(pageIdx * 4, pageIdx * 4 + 4);
    pageOrders.forEach((order, index) => {
      const pos = quadrants[index];
      drawReceiptQuadrant(doc, order, store, pos.x, pos.y, receiptWidth, receiptHeight);
    });

    // Page indicator footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${pageIdx + 1} of ${totalPages} - 4 receipts per A4 sheet`,
      pageWidth / 2,
      pageHeight - 2,
      { align: "center" }
    );
  }

  return doc;
}
