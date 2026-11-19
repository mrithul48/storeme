// apps/mobile/src/components/analytics/OrderLifecycleCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShoppingBag, Clock, CheckCircle2, Truck, RefreshCw, XCircle } from "lucide-react-native";
import { Card } from "../common/Card";
import { Colors } from "../../constants/theme";
import { OrderSummary } from "../../types";

interface OrderLifecycleCardProps {
  summary: OrderSummary | null;
}

export const OrderLifecycleCard: React.FC<OrderLifecycleCardProps> = ({ summary }) => {
  if (!summary) return null;

  const statuses = [
    {
      label: "Pending",
      count: summary.pendingOrders || 0,
      icon: <Clock size={13} color={Colors.warning} />,
      color: Colors.warning,
      bg: Colors.warningBg,
      border: Colors.warningBorder,
    },
    {
      label: "Confirmed",
      count: summary.confirmedOrders || 0,
      icon: <CheckCircle2 size={13} color={Colors.primaryText} />,
      color: Colors.primaryText,
      bg: Colors.primaryLight,
      border: "rgba(99, 139, 255, 0.3)",
    },
    {
      label: "Processing",
      count: summary.processingOrders || 0,
      icon: <RefreshCw size={13} color="#8BA8FF" />,
      color: "#8BA8FF",
      bg: "rgba(139, 168, 255, 0.12)",
      border: "rgba(139, 168, 255, 0.25)",
    },
    {
      label: "Shipped",
      count: summary.shippedOrders || 0,
      icon: <Truck size={13} color={Colors.info} />,
      color: Colors.info,
      bg: Colors.infoBg,
      border: Colors.infoBorder,
    },
    {
      label: "Delivered",
      count: summary.deliveredOrders || 0,
      icon: <CheckCircle2 size={13} color={Colors.success} />,
      color: Colors.success,
      bg: Colors.successBg,
      border: Colors.successBorder,
    },
    {
      label: "Cancelled",
      count: summary.cancelledOrders || 0,
      icon: <XCircle size={13} color={Colors.danger} />,
      color: Colors.danger,
      bg: Colors.dangerBg,
      border: Colors.dangerBorder,
    },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ShoppingBag size={16} color={Colors.primaryText} />
          <Text style={styles.title}>Order Lifecycle Status</Text>
        </View>
        <Text style={styles.totalBadge}>{summary.totalOrders} total</Text>
      </View>

      {/* 2x3 Grid of Status Tiles */}
      <View style={styles.grid}>
        {statuses.map((item) => (
          <View
            key={item.label}
            style={[
              styles.tile,
              { backgroundColor: item.bg, borderColor: item.border },
            ]}
          >
            <View style={styles.tileHeader}>
              {item.icon}
              <Text style={[styles.tileLabel, { color: item.color }]}>
                {item.label}
              </Text>
            </View>
            <Text style={[styles.tileCount, { color: item.color }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  totalBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    width: "48.5%",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tileCount: {
    fontSize: 18,
    fontWeight: "800",
  },
});

