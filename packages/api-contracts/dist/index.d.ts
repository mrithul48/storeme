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
export declare const API_ROUTES: {
    readonly HEALTH: "/api/v1/health";
    readonly AUTH: {
        readonly LOGIN: "/api/v1/auth/login";
        readonly REGISTER: "/api/v1/auth/register";
        readonly REFRESH: "/api/v1/auth/refresh";
        readonly LOGOUT: "/api/v1/auth/logout";
        readonly SESSIONS: "/api/v1/auth/sessions";
        readonly FORGOT_PASSWORD: "/api/v1/auth/forgot-password";
        readonly RESET_PASSWORD: "/api/v1/auth/reset-password";
        readonly ME: "/api/v1/auth/me";
    };
    readonly STORES: {
        readonly CURRENT: "/api/v1/stores/current";
        readonly LIST: "/api/v1/stores";
    };
    readonly DASHBOARD: {
        readonly STATS: "/api/v1/dashboard/stats";
    };
    readonly PRODUCTS: {
        readonly ROOT: "/api/v1/products";
        readonly DETAIL: (id: string) => string;
    };
    readonly CATEGORIES: {
        readonly ROOT: "/api/v1/categories";
        readonly DETAIL: (id: string) => string;
    };
    readonly BRANDS: {
        readonly ROOT: "/api/v1/brands";
        readonly DETAIL: (id: string) => string;
    };
    readonly INVENTORY: {
        readonly ROOT: "/api/v1/inventory";
        readonly DETAIL: (productId: string) => string;
        readonly ADJUST: "/api/v1/inventory/adjust";
    };
    readonly ORDERS: {
        readonly ROOT: "/api/v1/orders";
        readonly DETAIL: (id: string) => string;
        readonly STATUS: (id: string) => string;
        readonly SUMMARY: "/api/v1/orders/summary";
        readonly RECENT: "/api/v1/orders/recent";
    };
};
