// src/lib/shipping-calculator.ts
// Centralized shipping charge calculation engine for multi-tenant stores.
// Supports:
// 1. Fixed Shipping Charge
// 2. Free Shipping Above a Minimum Order Amount
// 3. Weight-Based Shipping Charge (with weight tiers and missing weight handling)

export type ShippingType = "FIXED" | "FREE_ABOVE_MIN" | "WEIGHT_BASED" | null;

export type DecimalLike = number | string | { toString(): string } | null | undefined;

export interface ShippingWeightTier {
  id?: string;
  minWeight: number; // in kg
  maxWeight: number; // in kg
  charge: number; // in currency units (₹)
}

export interface StoreShippingSettings {
  shippingType?: string | null;
  shippingFixedCharge?: DecimalLike;
  shippingMinOrderAmount?: DecimalLike;
  shippingFallbackCharge?: DecimalLike;
  shippingDefaultWeight?: DecimalLike;
  shippingWeightRates?: ShippingWeightTier[] | any;
}

export interface ShippingItemInput {
  quantity: number;
  product: {
    id?: string;
    name: string;
    weight?: DecimalLike;
  };
}

export interface ShippingCalculationResult {
  shippingCharge: number;
  shippingType: ShippingType;
  subtotal: number;
  total: number;
  isFree: boolean;
  freeShippingThreshold?: number;
  amountNeededForFree?: number;
  totalWeight?: number; // in kg
  matchedTier?: ShippingWeightTier;
}

/**
 * Calculates shipping charge based on store settings, order subtotal, and cart items with weights.
 * Throws a descriptive error if configuration is invalid or product weights are missing.
 */
export function calculateShippingCharge(
  settings: StoreShippingSettings | null | undefined,
  subtotal: number,
  items: ShippingItemInput[]
): ShippingCalculationResult {
  const cleanSubtotal = Math.max(0, Number(subtotal) || 0);

  // If no shipping type configured or set to empty, default to Free (0)
  if (!settings || !settings.shippingType || settings.shippingType === "NONE") {
    return {
      shippingCharge: 0,
      shippingType: null,
      subtotal: cleanSubtotal,
      total: cleanSubtotal,
      isFree: true,
    };
  }

  const shippingType = settings.shippingType as ShippingType;

  // 1. FIXED SHIPPING CHARGE
  if (shippingType === "FIXED") {
    const charge = Math.max(0, Number(settings.shippingFixedCharge ?? 0));
    return {
      shippingCharge: charge,
      shippingType: "FIXED",
      subtotal: cleanSubtotal,
      total: cleanSubtotal + charge,
      isFree: charge === 0,
    };
  }

  // 2. FREE SHIPPING ABOVE A MINIMUM ORDER AMOUNT
  if (shippingType === "FREE_ABOVE_MIN") {
    const minOrderAmount = Math.max(0, Number(settings.shippingMinOrderAmount ?? 0));
    const fallbackCharge = Math.max(0, Number(settings.shippingFallbackCharge ?? 0));

    if (cleanSubtotal >= minOrderAmount) {
      return {
        shippingCharge: 0,
        shippingType: "FREE_ABOVE_MIN",
        subtotal: cleanSubtotal,
        total: cleanSubtotal,
        isFree: true,
        freeShippingThreshold: minOrderAmount,
        amountNeededForFree: 0,
      };
    } else {
      const needed = Math.max(0, minOrderAmount - cleanSubtotal);
      return {
        shippingCharge: fallbackCharge,
        shippingType: "FREE_ABOVE_MIN",
        subtotal: cleanSubtotal,
        total: cleanSubtotal + fallbackCharge,
        isFree: fallbackCharge === 0,
        freeShippingThreshold: minOrderAmount,
        amountNeededForFree: needed,
      };
    }
  }

  // 3. WEIGHT-BASED SHIPPING CHARGE
  if (shippingType === "WEIGHT_BASED") {
    const defaultWeight =
      settings.shippingDefaultWeight !== null && settings.shippingDefaultWeight !== undefined
        ? Number(settings.shippingDefaultWeight)
        : null;

    let totalWeight = 0;

    for (const item of items) {
      const rawWeight = item.product.weight;
      const parsedWeight =
        rawWeight !== null && rawWeight !== undefined && rawWeight !== ""
          ? Number(rawWeight)
          : null;

      const effectiveWeight =
        parsedWeight !== null && parsedWeight > 0
          ? parsedWeight
          : defaultWeight !== null && defaultWeight > 0
          ? defaultWeight
          : null;

      if (effectiveWeight === null) {
        throw new Error(
          `Weight is missing for product "${item.product.name}". Please add product weight or configure a store default weight in Shipping Settings.`
        );
      }

      totalWeight += effectiveWeight * Math.max(1, item.quantity);
    }

    // Round total weight to 3 decimal places for stability
    totalWeight = Math.round(totalWeight * 1000) / 1000;

    const rawRates = settings.shippingWeightRates;
    const rates: ShippingWeightTier[] = Array.isArray(rawRates) ? rawRates : [];

    if (rates.length === 0) {
      throw new Error(
        "Weight-based shipping is active, but no weight rate tiers are configured in Store Settings."
      );
    }

    // Sort rates ascending by minWeight
    const sortedRates = [...rates].sort((a, b) => Number(a.minWeight) - Number(b.minWeight));

    // Find the tier that matches: minWeight <= totalWeight <= maxWeight
    const matchedTier = sortedRates.find((tier) => {
      const min = Number(tier.minWeight ?? 0);
      const max =
        tier.maxWeight !== null && tier.maxWeight !== undefined && tier.maxWeight !== ("" as any)
          ? Number(tier.maxWeight)
          : Infinity;
      return totalWeight >= min && totalWeight <= max;
    });

    if (!matchedTier) {
      throw new Error(
        `Total order weight (${totalWeight} kg) does not match any configured shipping weight tier. Please contact the store or adjust order quantity.`
      );
    }

    const charge = Math.max(0, Number(matchedTier.charge ?? 0));

    return {
      shippingCharge: charge,
      shippingType: "WEIGHT_BASED",
      subtotal: cleanSubtotal,
      total: cleanSubtotal + charge,
      isFree: charge === 0,
      totalWeight,
      matchedTier,
    };
  }

  // Fallback
  return {
    shippingCharge: 0,
    shippingType: null,
    subtotal: cleanSubtotal,
    total: cleanSubtotal,
    isFree: true,
  };
}
