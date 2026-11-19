// apps/mobile/src/components/analytics/ChannelBreakdownCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart, CreditCard, Banknote, MessageCircle } from "lucide-react-native";
import { Card } from "../common/Card";
import { Colors } from "../../constants/theme";
import { AnalyticsChannels } from "../../types";

interface ChannelBreakdownCardProps {
  channels: AnalyticsChannels;
}

export const ChannelBreakdownCard: React.FC<ChannelBreakdownCardProps> = ({
  channels,
}) => {
  const total = (channels.cod || 0) + (channels.online || 0) + (channels.whatsapp || 0);

  const codPercent = total > 0 ? Math.round(((channels.cod || 0) / total) * 100) : 0;
  const onlinePercent = total > 0 ? Math.round(((channels.online || 0) / total) * 100) : 0;
  const whatsappPercent = total > 0 ? Math.round(((channels.whatsapp || 0) / total) * 100) : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <PieChart size={16} color={Colors.primaryText} />
          <Text style={styles.title}>Order Channel Breakdown</Text>
        </View>
        <Text style={styles.totalBadge}>{total} orders</Text>
      </View>

      {/* Stacked Percentage Bar */}
      <View style={styles.stackedBar}>
        {codPercent > 0 && (
          <View style={[styles.barSegment, { flex: codPercent, backgroundColor: "#F59E0B" }]} />
        )}
        {onlinePercent > 0 && (
          <View style={[styles.barSegment, { flex: onlinePercent, backgroundColor: "#4169E1" }]} />
        )}
        {whatsappPercent > 0 && (
          <View style={[styles.barSegment, { flex: whatsappPercent, backgroundColor: "#22C55E" }]} />
        )}
        {total === 0 && (
          <View style={[styles.barSegment, { flex: 1, backgroundColor: Colors.border }]} />
        )}
      </View>

      {/* Legend & Count Rows */}
      <View style={styles.legendGrid}>
        {/* Cash on Delivery */}
        <View style={styles.legendItem}>
          <View style={styles.legendIconRow}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Banknote size={14} color="#F59E0B" />
            <Text style={styles.legendLabel}>COD</Text>
          </View>
          <Text style={styles.legendCount}>{channels.cod || 0}</Text>
          <Text style={styles.legendPercent}>{codPercent}%</Text>
        </View>

        {/* Online Payment */}
        <View style={styles.legendItem}>
          <View style={styles.legendIconRow}>
            <View style={[styles.legendDot, { backgroundColor: "#4169E1" }]} />
            <CreditCard size={14} color="#638BFF" />
            <Text style={styles.legendLabel}>Online</Text>
          </View>
          <Text style={styles.legendCount}>{channels.online || 0}</Text>
          <Text style={styles.legendPercent}>{onlinePercent}%</Text>
        </View>

        {/* WhatsApp Checkout */}
        <View style={styles.legendItem}>
          <View style={styles.legendIconRow}>
            <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
            <MessageCircle size={14} color="#22C55E" />
            <Text style={styles.legendLabel}>WhatsApp</Text>
          </View>
          <Text style={styles.legendCount}>{channels.whatsapp || 0}</Text>
          <Text style={styles.legendPercent}>{whatsappPercent}%</Text>
        </View>
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
  stackedBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: Colors.surfaceMuted,
    marginBottom: 14,
    gap: 2,
  },
  barSegment: {
    height: "100%",
  },
  legendGrid: {
    flexDirection: "row",
    gap: 8,
  },
  legendItem: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  legendIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  legendCount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  legendPercent: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});

