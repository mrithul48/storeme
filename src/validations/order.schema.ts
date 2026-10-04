// src/validations/order.schema.ts

import { z } from "zod";

export const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian phone number required")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Address is required").max(500),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  notes: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  customer: checkoutFormSchema,
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1, "Order must have at least one item"),
  notes: z.string().max(500).optional(),
  paymentMethod: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  orderId: z.string().cuid().optional(),
  subscriptionId: z.string().cuid().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
