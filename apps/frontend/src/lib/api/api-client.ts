// src/lib/api/api-client.ts
// Centralized API client for Next.js to NestJS backend communication

import { API_BASE_URL } from "./api-config";
import { ApiError } from "./api-errors";
import { RequestOptions } from "./api-types";
import { generateInternalServiceToken } from "./api-auth";

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const normalizedPath = path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  if (!params) return normalizedPath;

  const url = new URL(normalizedPath);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
}

async function executeRequest<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const {
    storeId,
    storeSlug,
    internalUser,
    idempotencyKey,
    params,
    revalidate,
    tags,
    body,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const url = buildUrl(path, params);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (storeId) {
    headers["x-store-id"] = storeId;
  }
  if (storeSlug) {
    headers["x-store-slug"] = storeSlug;
  }
  if (idempotencyKey) {
    headers["x-idempotency-key"] = idempotencyKey;
  }

  // Generate internal service token on the server when user context is provided or server-side call
  if (typeof window === "undefined" && internalUser) {
    try {
      const internalToken = generateInternalServiceToken({
        userId: internalUser.id,
        email: internalUser.email,
        role: internalUser.role,
        storeId,
      });
      headers["x-internal-token"] = internalToken;
    } catch (err) {
      console.error("[api-client] Failed to generate internal service token:", err);
    }
  }

  const nextOptions: Record<string, any> = {};
  if (revalidate !== undefined) {
    nextOptions.revalidate = revalidate;
  }
  if (tags && tags.length > 0) {
    nextOptions.tags = tags;
  }

  const fetchConfig: RequestInit & { next?: any } = {
    method,
    headers,
    ...fetchOptions,
    ...(Object.keys(nextOptions).length > 0 ? { next: nextOptions } : {}),
  };

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    fetchConfig.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchConfig);
  } catch (error: any) {
    const isConnRefused =
      error?.cause?.code === "ECONNREFUSED" ||
      error?.message === "fetch failed" ||
      error?.name === "TypeError";
    const message = isConnRefused
      ? `Cannot connect to backend API server at ${url}. Please ensure the NestJS backend is running (run 'npm run backend:dev' in a separate terminal).`
      : error?.message || "Failed to connect to backend API server";
    throw new ApiError(message, 503, error);
  }

  let responseData: any;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    throw ApiError.fromResponse(responseData, response.status);
  }

  return responseData as T;
}

export function unwrapData<T>(res: any): T {
  if (res && typeof res === "object") {
    if ("data" in res && res.data !== undefined) {
      if (res.data && typeof res.data === "object" && "data" in res.data && res.data.data !== undefined) {
        return res.data.data as T;
      }
      return res.data as T;
    }
  }
  return res as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>("GET", path, options);
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return executeRequest<T>("POST", path, { ...options, body });
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return executeRequest<T>("PUT", path, { ...options, body });
  },
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return executeRequest<T>("PATCH", path, { ...options, body });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>("DELETE", path, options);
  },
};
