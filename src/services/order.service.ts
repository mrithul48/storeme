// src/services/order.service.ts
// Business logic for order creation and management

import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import type { CreateOrderInput } from "@/validations/order.schema";

/**
 * Create an order — backend recalculates all prices from DB
 * Never trust frontend price/total values
 */
export async function createOrder(storeId: string, data: CreateOrderInput) {
  // 1. Fetch actual product data from DB (never trust client prices)
  const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      storeId, // enforce tenant isolation
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      salePrice: true,
      stock: true,
      manageStockQuantity: true,
      manageStockAvailability: true,
      inStock: true,
      variants: {
        select: {
          id: true,
          color: true,
          manageAvailability: true,
          inStock: true,
          manageQuantity: true,
          stock: true,
        },
      },
    },
  });

  // 2. Validate all products exist and have sufficient stock
  const errors: string[] = [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      errors.push(`Product not found or unavailable`);
      continue;
    }

    // Color variant validation
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) =>
          (item.variantId && v.id === item.variantId) ||
          (item.variantColor && v.color.toLowerCase() === item.variantColor.toLowerCase())
      );

      if (!variant) {
        errors.push(`Please select a valid color variant for "${product.name}"`);
        continue;
      }

      // Check variant availability
      if (variant.manageAvailability && !variant.inStock) {
        errors.push(`"${product.name} (${variant.color})" is currently out of stock`);
        continue;
      }

      // Check variant quantity
      if (variant.manageQuantity) {
        if (variant.stock <= 0) {
          errors.push(`"${product.name} (${variant.color})" is out of stock`);
        } else if (variant.stock < item.quantity) {
          errors.push(
            `Insufficient stock for "${product.name} (${variant.color})". Available: ${variant.stock}`
          );
        }
      }
    } else {
      // General product stock validation
      if (product.manageStockAvailability && !product.inStock) {
        errors.push(`"${product.name}" is currently out of stock`);
        continue;
      }

      const isQtyManaged = product.manageStockQuantity;
      if (isQtyManaged) {
        if (product.stock <= 0) {
          errors.push(`"${product.name}" is out of stock`);
        } else if (product.stock < item.quantity) {
          errors.push(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  // 3. Calculate correct totals from DB prices
  const orderItems = data.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const variant = product.variants?.find(
      (v) =>
        (item.variantId && v.id === item.variantId) ||
        (item.variantColor && v.color.toLowerCase() === item.variantColor.toLowerCase())
    );
    const unitPrice = product.salePrice
      ? Number(product.salePrice)
      : Number(product.price);
    const subtotal = unitPrice * item.quantity;

    return {
      productId: item.productId,
      productName: variant ? `${product.name} (${variant.color})` : product.name,
      productSku: product.sku,
      variantId: variant?.id || null,
      variantColor: variant?.color || null,
      price: unitPrice,
      quantity: item.quantity,
      subtotal,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const total = subtotal; // No additional fees for now

  // 4. Create or find customer (upsert per store+email)
  const customer = await prisma.customer.upsert({
    where: {
      storeId_email: {
        storeId,
        email: data.customer.email,
      },
    },
    update: {
      name: data.customer.name,
      phone: data.customer.phone || null,
    },
    create: {
      storeId,
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone || null,
    },
  });

  const orderNumber = generateOrderNumber();

  // 5. Create order + items and deduct stock atomically in transaction
  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        storeId,
        orderNumber,
        customerId: customer.id,
        subtotal,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: data.paymentMethod || "COD",
        orderChannel:
          data.orderChannel ||
          (data.paymentMethod === "RAZORPAY"
            ? "ONLINE_PAYMENT"
            : data.paymentMethod === "WHATSAPP"
            ? "WHATSAPP"
            : "COD"),
        notes: data.notes || null,
        shippingAddress: {
          address: data.customer.address,
          city: data.customer.city,
          state: data.customer.state,
          pincode: data.customer.pincode,
        },
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // 6. Reduce stock atomically using conditional updates to prevent overselling
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) =>
            (item.variantId && v.id === item.variantId) ||
            (item.variantColor && v.color.toLowerCase() === item.variantColor.toLowerCase())
        );
        if (variant && variant.manageQuantity) {
          const res = await tx.productVariant.updateMany({
            where: {
              id: variant.id,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            throw new Error(
              `Insufficient stock for "${product.name} (${variant.color})". It may have just sold out.`
            );
          }
        }
      } else {
        const isQtyManaged = product.manageStockQuantity;
        if (isQtyManaged) {
          const res = await tx.product.updateMany({
            where: {
              id: product.id,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            throw new Error(
              `Insufficient stock for "${product.name}". It may have just sold out.`
            );
          }
        }
      }
    }

    return createdOrder;
  });

  return order;
}


/**
 * List orders with pagination and filters (dashboard)
 */
export async function listOrders(
  storeId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    channel?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const { page = 1, limit = 20, search, status, paymentStatus, channel, sortOrder = "desc" } = params;
  const skip = (page - 1) * limit;

  const where = {
    storeId,
    ...(status ? { status: status as never } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
    ...(channel ? { orderChannel: channel as never } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { customer: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        orderChannel: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        customer: {
          select: { name: true, email: true, phone: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((o) => ({ ...o, itemCount: o._count.items })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get full order details (tenant-scoped)
 */
export async function getOrder(storeId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, storeId }, // ALWAYS scope by storeId
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      payment: true,
    },
  });
}

/**
 * Update order status (tenant-scoped)
 */
export async function updateOrderStatus(
  storeId: string,
  orderId: string,
  data: { status?: string; paymentStatus?: string }
) {
  const existing = await prisma.order.findFirst({ where: { id: orderId, storeId } });
  if (!existing) return null;

  return prisma.order.update({
    where: { id: orderId },
    data: {
      ...(data.status ? { status: data.status as never } : {}),
      ...(data.paymentStatus ? { paymentStatus: data.paymentStatus as never } : {}),
    },
  });
}
