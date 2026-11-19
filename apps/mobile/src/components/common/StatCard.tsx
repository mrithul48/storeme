// apps/mobile/src/components/common/StatCard.tsx
import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Card } from "./Card";
import { Colors } from "../../constants/theme";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = "default",
  style,
}) => {
  const valueColor = getVariantColor(variant);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      </View>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </Card>
  );
};

function getVariantColor(variant: string): string {
  switch (variant) {
    case "primary":
      return Colors.primaryText;
    case "success":
      return Colors.success;
    case "warning":
      return Colors.warning;
    case "danger":
      return Colors.danger;
    case "info":
      return Colors.info;
    default:
      return Colors.textPrimary;
  }
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
