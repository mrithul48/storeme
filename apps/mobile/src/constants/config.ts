// apps/mobile/src/constants/config.ts
// Environment and release configuration for LaunchCommerce Mobile

import { Platform } from "react-native";

function getApiBaseUrl(): string {
  if (Platform.OS === "web") {
    return "http://localhost:4000/api/v1";
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!envUrl) {
    console.error(
      "[Config] EXPO_PUBLIC_API_URL is undefined on native! Please define EXPO_PUBLIC_API_URL in apps/mobile/.env"
    );
    // Fallback to avoid fatal crash
    return "http://localhost:4000/api/v1";
  }

  return envUrl.replace(/\/+$/, "");
}

export const Config = {
  apiBaseUrl: getApiBaseUrl(),
  requestTimeoutMs: 15000,
  appName: "LaunchCommerce",
  appVersion: "1.0.0",
  buildNumber: 1,
  applicationId: "com.launchcommerce.merchant",
  isProduction: !__DEV__,
};
