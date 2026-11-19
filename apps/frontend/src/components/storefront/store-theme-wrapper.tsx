import React from "react";
import { getStoreThemeStyles, type ThemeConfig } from "@/lib/store-theme";

interface StoreThemeWrapperProps {
  theme?: ThemeConfig | null;
  children: React.ReactNode;
  className?: string;
}

export function StoreThemeWrapper({ theme, children, className = "" }: StoreThemeWrapperProps) {
  const { style, isLight } = getStoreThemeStyles(theme);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${isLight ? "store-theme-light" : "store-theme-dark"} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
