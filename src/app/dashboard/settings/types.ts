export type SettingsTab =
  | "general"
  | "products"
  | "orders"
  | "theme"
  | "domain"
  | "payments"
  | "customerAuth";

export type StockManagementType = "AVAILABILITY" | "QUANTITY" | "COLOR_WISE" | null;
export type ColorWiseStockType = "AVAILABILITY" | "QUANTITY";

export interface StoreSettingsClientProps {
  store: any;
}

export type RazorpayStatus = {
  connected: boolean;
  keyId?: string;
  mode?: string;
} | null;
