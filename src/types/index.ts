// src/types/index.ts
// Central type exports

export type { ApiResponse, PaginatedResponse, PaginationParams } from "./api.types";
export type {
  StoreWithRelations,
  StoreConfigForStorefront,
  OnboardingData,
  ThemeConfig,
  WorkingHoursConfig,
} from "./store.types";
export type {
  ProductWithRelations,
  ProductListItem,
  CreateProductInput,
  UpdateProductInput,
} from "./product.types";
export type {
  OrderWithRelations,
  OrderListItem,
  CreateOrderInput,
  CartItem,
  CheckoutFormData,
} from "./order.types";
