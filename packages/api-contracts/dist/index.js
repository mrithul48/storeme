"use strict";
// packages/api-contracts/src/index.ts
// Standardized API response wrappers, error models, and route constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
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
        DETAIL: (id) => `/api/v1/products/${id}`,
    },
    CATEGORIES: {
        ROOT: "/api/v1/categories",
        DETAIL: (id) => `/api/v1/categories/${id}`,
    },
    BRANDS: {
        ROOT: "/api/v1/brands",
        DETAIL: (id) => `/api/v1/brands/${id}`,
    },
    INVENTORY: {
        ROOT: "/api/v1/inventory",
        DETAIL: (productId) => `/api/v1/inventory/${productId}`,
        ADJUST: "/api/v1/inventory/adjust",
    },
    ORDERS: {
        ROOT: "/api/v1/orders",
        DETAIL: (id) => `/api/v1/orders/${id}`,
        STATUS: (id) => `/api/v1/orders/${id}/status`,
        SUMMARY: "/api/v1/orders/summary",
        RECENT: "/api/v1/orders/recent",
    },
};
