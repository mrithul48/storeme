// apps/mobile/app/(app)/(tabs)/more/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { Colors } from "../../../../src/constants/theme";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="brands" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}

