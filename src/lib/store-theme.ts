// src/lib/store-theme.ts
// Centralized design token system and color utility functions for storefront multi-tenancy.
// Generates standardized CSS variables so storefront components adapt flawlessly to light & dark themes.

export interface ThemeConfig {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;
  navbarBg?: string | null;
  navbarText?: string | null;
  buttonBg?: string | null;
  buttonText?: string | null;
  h1Color?: string | null;
  h2Color?: string | null;
  paragraphColor?: string | null;
  buttonShape?: "SQUARE" | "MEDIUM_ROUNDED" | "FULLY_ROUNDED" | string | null;
  primaryFont?: string | null;
}

/**
 * Parses a hex color string to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

/**
 * Calculates relative luminance according to WCAG 2.1 specs.
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Checks if a hex color is perceived as light.
 */
export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.45;
}

/**
 * Calculates WCAG contrast ratio between two colors (1:1 to 21:1).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generates centralized CSS variables object for a given theme configuration.
 */
export function getStoreThemeVariables(theme?: ThemeConfig | null): React.CSSProperties {
  const navbarBg = theme?.navbarBg || "#ffffff";
  const isNavLight = isLightColor(navbarBg);
  const navbarText = theme?.navbarText || (isNavLight ? "#0f172a" : "#f8fafc");

  const pageBg = theme?.backgroundColor || "#ffffff";
  const isPageLight = isLightColor(pageBg);
  const pageText = theme?.textColor || (isPageLight ? "#0f172a" : "#f8fafc");
  const pageMuted = theme?.mutedTextColor || (isPageLight ? "#64748b" : "#94a3b8");
  const pageHeading = theme?.h1Color || (isPageLight ? "#020617" : "#ffffff");
  const pageSubheading = theme?.h2Color || (isPageLight ? "#1e293b" : "#f1f5f9");
  const paragraph = theme?.paragraphColor || pageText;

  const buttonBg = theme?.buttonBg || theme?.primaryColor || "#22c55e";
  const isBtnLight = isLightColor(buttonBg);
  const buttonText = theme?.buttonText || (isBtnLight ? "#0f172a" : "#ffffff");

  const surface = theme?.surfaceColor || (isPageLight ? "#ffffff" : "#0f172a");
  const surfaceBorder = isPageLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)";

  const buttonRadius =
    theme?.buttonShape === "SQUARE"
      ? "0px"
      : theme?.buttonShape === "FULLY_ROUNDED"
      ? "9999px"
      : "10px";

  return {
    "--store-navbar-bg": navbarBg,
    "--store-navbar-text": navbarText,
    "--store-page-bg": pageBg,
    "--store-page-text": pageText,
    "--store-page-muted": pageMuted,
    "--store-page-heading": pageHeading,
    "--store-page-subheading": pageSubheading,
    "--store-page-paragraph": paragraph,
    "--store-button-bg": buttonBg,
    "--store-button-text": buttonText,
    "--store-surface": surface,
    "--store-border": surfaceBorder,
    "--store-primary": theme?.primaryColor || "#22c55e",
    "--store-button-radius": buttonRadius,
  } as React.CSSProperties;
}

/**
 * Returns dynamic root container classes and styles for consistent storefront theming.
 */
export function getStoreThemeStyles(theme?: ThemeConfig | null) {
  const vars = getStoreThemeVariables(theme);
  const isPageLight = isLightColor((vars as Record<string, string>)["--store-page-bg"] || "#ffffff");

  return {
    style: {
      ...vars,
      backgroundColor: "var(--store-page-bg)",
      color: "var(--store-page-text)",
      fontFamily: theme?.primaryFont || "Inter, sans-serif",
    },
    isLight: isPageLight,
  };
}
