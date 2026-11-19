// apps/mobile/src/utils/storage.ts
// Cross-platform secure storage adapter (SecureStore on iOS/Android, localStorage on Web)

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// In-memory fallback if web localStorage is inaccessible (e.g. strict incognito)
const memoryStorage = new Map<string, string>();

export const SecureStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        return memoryStorage.get(key) || null;
      }
      return memoryStorage.get(key) || null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch {
        memoryStorage.set(key, value);
        return;
      }
      memoryStorage.set(key, value);
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      if (__DEV__) {
        console.warn("[SecureStorage] Failed to set native secure item:", err);
      }
    }
  },

  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch {
        memoryStorage.delete(key);
        return;
      }
      memoryStorage.delete(key);
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore if item does not exist
    }
  },
};

