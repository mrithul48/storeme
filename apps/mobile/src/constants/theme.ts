// apps/mobile/src/constants/theme.ts
// LaunchCommerce Design Tokens for React Native (iOS & Android)

export const Colors = {
  // Brand & Background
  background: "#080D28",
  backgroundSecondary: "#05081C",
  surface: "#0F1738",
  surfaceElevated: "#17224D",
  surfaceMuted: "#10193D",

  // Borders
  border: "#202D55",
  borderLight: "#2B3C70",
  borderActive: "#638BFF",

  // Typography
  textPrimary: "#F5F7FF",
  textSecondary: "#A5B2D1",
  textMuted: "#6B7A9F",
  textDisabled: "#434E6B",

  // Accent & Action
  primary: "#4169E1",
  primaryHover: "#557BF5",
  primaryLight: "rgba(65, 105, 225, 0.15)",
  primaryText: "#638BFF",

  // Semantic
  success: "#22C55E",
  successBg: "rgba(34, 197, 94, 0.12)",
  successBorder: "rgba(34, 197, 94, 0.25)",

  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.12)",
  warningBorder: "rgba(245, 158, 11, 0.25)",

  danger: "#EF4444",
  dangerBg: "rgba(239, 68, 68, 0.12)",
  dangerBorder: "rgba(239, 68, 68, 0.25)",

  info: "#38BDF8",
  infoBg: "rgba(56, 189, 248, 0.12)",
  infoBorder: "rgba(56, 189, 248, 0.25)",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500" as const,
    color: Colors.textMuted,
  },
};

