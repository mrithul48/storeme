// src/lib/api/api-types.ts
// Request options and shared API response typings

export interface RequestOptions extends Omit<RequestInit, "body"> {
  storeId?: string;
  storeSlug?: string;
  internalUser?: {
    id: string;
    email: string;
    role: "USER" | "PLATFORM_ADMIN";
  };
  idempotencyKey?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number | false;
  tags?: string[];
  body?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data: T;
  statusCode?: number;
  timestamp?: string;
}

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: ApiPaginationMeta;
}

