// apps/mobile/src/stores/auth-store.ts
import { create } from "zustand";
import { Platform } from "react-native";
import { SecureStorage } from "../utils/storage";
import { User, Store, AuthTokens } from "../types";
import { Config } from "../constants/config";

const ACCESS_TOKEN_KEY = "lc_merchant_access_token";
const REFRESH_TOKEN_KEY = "lc_merchant_refresh_token";
const DEVICE_ID_KEY = "lc_merchant_device_id";
const USER_KEY = "lc_merchant_user";
const STORE_KEY = "lc_merchant_store";

interface AuthState {
  user: User | null;
  store: Store | null;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setStore: (store: Store) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  clearError: () => void;
}

// Generate simple device id fallback if native UUID isn't available
function generateFallbackDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `mobile-${Platform.OS}-${timestamp}-${random}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  store: null,
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Retrieve device id or create one
      let deviceId = await SecureStorage.getItemAsync(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = generateFallbackDeviceId();
        await SecureStorage.setItemAsync(DEVICE_ID_KEY, deviceId);
      }

      // Retrieve tokens and user
      const accessToken = await SecureStorage.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStorage.getItemAsync(REFRESH_TOKEN_KEY);
      const rawUser = await SecureStorage.getItemAsync(USER_KEY);
      const rawStore = await SecureStorage.getItemAsync(STORE_KEY);

      const user: User | null = rawUser ? JSON.parse(rawUser) : null;
      const store: Store | null = rawStore ? JSON.parse(rawStore) : null;

      if (accessToken && user) {
        set({
          user,
          store,
          accessToken,
          refreshToken,
          deviceId,
          isAuthenticated: true,
          isLoading: false,
        });

        // Validate session with backend asynchronously
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const meRes = await fetch(`${Config.apiBaseUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const meJson = await meRes.json().catch(() => null);

          if (meRes.ok && meJson?.success && meJson?.data) {
            set({ user: meJson.data });
            await SecureStorage.setItemAsync(USER_KEY, JSON.stringify(meJson.data));
          } else if (meRes.status === 401 && refreshToken && deviceId) {
            // Access token expired, attempt refresh
            const refreshRes = await fetch(`${Config.apiBaseUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken, deviceId }),
            });
            const refreshJson = await refreshRes.json().catch(() => null);

            if (refreshRes.ok && refreshJson?.success && refreshJson?.data) {
              const { accessToken: newAccess, refreshToken: newRefresh } = refreshJson.data;
              await SecureStorage.setItemAsync(ACCESS_TOKEN_KEY, newAccess);
              if (newRefresh) {
                await SecureStorage.setItemAsync(REFRESH_TOKEN_KEY, newRefresh);
              }
              set({
                accessToken: newAccess,
                refreshToken: newRefresh || refreshToken,
              });
            } else {
              // Refresh token also invalid or revoked
              await get().logout();
            }
          }
        } catch {
          // Network timeout or offline - retain persisted session
        }
      } else {
        set({
          deviceId,
          user: null,
          store: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn("[AuthStore] Failed to restore secure session:", err);
      }
      set({
        user: null,
        store: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      let deviceId = get().deviceId;
      if (!deviceId) {
        deviceId = await SecureStorage.getItemAsync(DEVICE_ID_KEY);
        if (!deviceId) {
          deviceId = generateFallbackDeviceId();
          await SecureStorage.setItemAsync(DEVICE_ID_KEY, deviceId);
        }
      }

      if (__DEV__) {
        console.log(`[AuthStore] Sending login request to: ${Config.apiBaseUrl}/auth/login`);
      }

      const response = await fetch(`${Config.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          deviceId,
          deviceName: `${Platform.OS.toUpperCase()} Merchant App`,
          platform: Platform.OS === "ios" ? "ios" : "android",
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        const errorMsg = json?.error || json?.message || "Invalid credentials. Please check and try again.";
        set({ error: errorMsg, isLoading: false });
        return false;
      }

      const { user, store, tokens } = json.data as {
        user: User;
        store: Store | null;
        tokens: AuthTokens;
      };

      // Persist in SecureStore
      await SecureStorage.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        await SecureStorage.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
      await SecureStorage.setItemAsync(USER_KEY, JSON.stringify(user));
      if (store) {
        await SecureStorage.setItemAsync(STORE_KEY, JSON.stringify(store));
      }

      set({
        user,
        store,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        deviceId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      if (__DEV__) {
        console.error(`[AuthStore] Login network error connecting to ${Config.apiBaseUrl}/auth/login:`, err);
      }
      set({
        error: `Unable to connect to backend at ${Config.apiBaseUrl}. Ensure your phone is on the same Wi-Fi and port 4000 is open.`,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      const { accessToken, refreshToken, deviceId } = get();

      // Revoke on backend if tokens exist
      if (accessToken) {
        fetch(`${Config.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken, deviceId }),
        }).catch((e) => {
          if (__DEV__) {
            console.warn("[AuthStore] Backend logout notification failed:", e);
          }
        });
      }

      // Clear SecureStore
      await SecureStorage.deleteItemAsync(ACCESS_TOKEN_KEY).catch(() => {});
      await SecureStorage.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
      await SecureStorage.deleteItemAsync(USER_KEY).catch(() => {});
      await SecureStorage.deleteItemAsync(STORE_KEY).catch(() => {});

      set({
        user: null,
        store: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (__DEV__) {
        console.warn("[AuthStore] Logout error:", err);
      }
      set({
        user: null,
        store: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setTokens: async (accessToken: string, refreshToken: string) => {
    await SecureStorage.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStorage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },

  setStore: async (store: Store) => {
    await SecureStorage.setItemAsync(STORE_KEY, JSON.stringify(store));
    set({ store });
  },

  setUser: async (user: User) => {
    await SecureStorage.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

