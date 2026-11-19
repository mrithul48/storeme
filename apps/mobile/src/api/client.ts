// apps/mobile/src/api/client.ts
// Centralized, typed API client for LaunchCommerce Mobile

import { Config } from "../constants/config";
import { useAuthStore } from "../stores/auth-store";

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export class MobileApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "MobileApiError";
    Object.setPrototypeOf(this, MobileApiError.prototype);
  }
}

// Token refresh mutex to prevent concurrent refresh storms
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAuthTokens(): Promise<string> {
  const { refreshToken, deviceId, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken || !deviceId) {
    await logout();
    throw new MobileApiError("Session expired. Please log in again.", 401);
  }

  try {
    const res = await fetch(`${Config.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, deviceId }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      await logout();
      throw new MobileApiError(json?.error || json?.message || "Token refresh failed", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = json.data;
    await setTokens(accessToken, newRefreshToken || refreshToken);
    return accessToken;
  } catch (err) {
    await logout();
    throw err;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const cleanPath = path.startsWith("http")
    ? path
    : `${Config.apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  if (!params) return cleanPath;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      searchParams.append(key, String(val));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${cleanPath}?${queryString}` : cleanPath;
}

export async function request<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { params, skipAuth, headers: customHeaders, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const { accessToken, store } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (store?.id) {
    headers["x-store-id"] = store.id;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (networkErr: unknown) {
    const msg =
      networkErr instanceof Error ? networkErr.message : "Network request failed. Verify backend connectivity.";
    throw new MobileApiError(msg, 0, networkErr);
  }

  // Handle 401 Unauthorized with token refresh
  if (response.status === 401 && !skipAuth) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newAccessToken: string) => {
            try {
              headers["Authorization"] = `Bearer ${newAccessToken}`;
              const retryRes = await fetch(url, { ...fetchOptions, headers });
              const retryJson = await retryRes.json().catch(() => null);
              if (!retryRes.ok) {
                reject(
                  new MobileApiError(
                    retryJson?.error || retryJson?.message || "Request failed",
                    retryRes.status,
                    retryJson
                  )
                );
              } else {
                resolve((retryJson?.data !== undefined ? retryJson.data : retryJson) as T);
              }
            } catch (retryErr) {
              reject(retryErr);
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAuthTokens();
      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request
      headers["Authorization"] = `Bearer ${newAccessToken}`;
      const retryResponse = await fetch(url, { ...fetchOptions, headers });
      const retryData = await retryResponse.json().catch(() => null);

      if (!retryResponse.ok) {
        throw new MobileApiError(
          retryData?.error || retryData?.message || `Request failed with status ${retryResponse.status}`,
          retryResponse.status,
          retryData
        );
      }

      return (retryData?.data !== undefined ? retryData.data : retryData) as T;
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      throw refreshErr;
    }
  }

  const responseJson = await response.json().catch(() => null);

  if (!response.ok) {
    const errMsg =
      responseJson?.error ||
      responseJson?.message ||
      `Request failed with HTTP ${response.status}`;
    throw new MobileApiError(errMsg, response.status, responseJson);
  }

  // If response has { success: true, data: T, pagination: P }, preserve both
  if (responseJson && typeof responseJson === "object" && "data" in responseJson) {
    if ("pagination" in responseJson && responseJson.pagination) {
      return {
        data: responseJson.data,
        pagination: responseJson.pagination,
      } as unknown as T;
    }
    return responseJson.data as T;
  }

  return responseJson as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
