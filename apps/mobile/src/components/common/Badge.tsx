// apps/mobile/src/components/common/Badge.tsx
import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";
import { Colors } from "../../constants/theme";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "muted",
  dot = false,
  size = "md",
  style,
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <View
      style={[
        styles.base,
        size === "sm" ? styles.sizeSm : styles.sizeMd,
        { backgroundColor: variantStyles.bg, borderColor: variantStyles.border },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: variantStyles.text }]} />}
      <Text
        style={[
          styles.text,
          size === "sm" ? styles.textSm : styles.textMd,
          { color: variantStyles.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

function getVariantStyles(variant: BadgeVariant): { bg: string; border: string; text: string } {
  switch (variant) {
    case "success":
      return { bg: Colors.successBg, border: Colors.successBorder, text: Colors.success };
    case "warning":
      return { bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning };
    case "danger":
      return { bg: Colors.dangerBg, border: Colors.dangerBorder, text: Colors.danger };
    case "info":
      return { bg: Colors.infoBg, border: Colors.infoBorder, text: Colors.info };
    case "primary":
      return { bg: Colors.primaryLight, border: "rgba(99, 139, 255, 0.3)", text: Colors.primaryText };
    case "muted":
    default:
      return { bg: Colors.surfaceMuted, border: Colors.border, text: Colors.textSecondary };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  sizeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  sizeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: "600",
  },
  textSm: {
    fontSize: 10,
    lineHeight: 12,
  },
  textMd: {
    fontSize: 11,
    lineHeight: 14,
  },
});
