// src/validations/store.schema.ts

import { z } from "zod";

export const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export const workingHoursDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  surfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  mutedTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  navbarBg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  navbarText: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  buttonBg: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonText: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  h1Color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  h2Color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  paragraphColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonShape: z.enum(["SQUARE", "MEDIUM_ROUNDED", "FULLY_ROUNDED"]),
  primaryFont: z.string().min(1).max(100),
});

export const createStoreSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  businessType: z.string().min(1, "Please select a business type"),
  businessAddress: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Invalid WhatsApp number")
    .optional()
    .or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
  phone: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
  workingHours: z.array(workingHoursDaySchema).optional(),
  theme: themeSchema.partial().optional(),
});

export const updateCompanySchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  businessType: z.string().min(1).optional(),
  address: z.string().max(500).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/)
    .optional()
    .or(z.literal("")),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
});

export const updateStoreSettingsSchema = z.object({
  brandsEnabled: z.boolean().optional(),
  ordersEnabled: z.boolean().optional(),
  codEnabled: z.boolean().optional(),
  onlinePaymentEnabled: z.boolean().optional(),
  whatsappOrderEnabled: z.boolean().optional(),
  razorpayKeyId: z.string().optional(),
  razorpaySecret: z.string().optional(),
  brevoApiKey: z.string().optional(),
  brevoSenderEmail: z.string().email().optional().or(z.literal("")),
  brevoSenderName: z.string().optional(),
});

export const updateCompanyDetailsSchema = updateCompanySchema;
export const themeSettingsSchema = themeSchema.partial();

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
