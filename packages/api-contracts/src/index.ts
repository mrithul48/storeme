// packages/api-contracts/src/index.ts
// Standardized API response wrappers, error models, and route constants

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: "connected" | "disconnected";
      latencyMs?: number;
    };
    redis: {
      status: "connected" | "disconnected" | "unavailable";
      latencyMs?: number;
    };
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
}

export const API_ROUTES = {
  HEALTH: "/api/v1/health",
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
    SESSIONS: "/api/v1/auth/sessions",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
    ME: "/api/v1/auth/me",
  },
  STORES: {
    CURRENT: "/api/v1/stores/current",
    LIST: "/api/v1/stores",
  },
  DASHBOARD: {
    STATS: "/api/v1/dashboard/stats",
  },
  PRODUCTS: {
    ROOT: "/api/v1/products",
    DETAIL: (id: string) => `/api/v1/products/${id}`,
  },
  CATEGORIES: {
    ROOT: "/api/v1/categories",
    DETAIL: (id: string) => `/api/v1/categories/${id}`,
  },
  BRANDS: {
    ROOT: "/api/v1/brands",
    DETAIL: (id: string) => `/api/v1/brands/${id}`,
  },
  INVENTORY: {
    ROOT: "/api/v1/inventory",
    DETAIL: (productId: string) => `/api/v1/inventory/${productId}`,
    ADJUST: "/api/v1/inventory/adjust",
  },
  ORDERS: {
    ROOT: "/api/v1/orders",
    DETAIL: (id: string) => `/api/v1/orders/${id}`,
    STATUS: (id: string) => `/api/v1/orders/${id}/status`,
    SUMMARY: "/api/v1/orders/summary",
    RECENT: "/api/v1/orders/recent",
  },
} as const;
