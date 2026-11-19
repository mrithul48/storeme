// apps/mobile/src/components/analytics/TopProductsLeaderboard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Trophy, TrendingUp, Package } from "lucide-react-native";
import { Card } from "../common/Card";
import { Colors } from "../../constants/theme";
import { TopProductAnalytics } from "../../types";

interface TopProductsLeaderboardProps {
  products: TopProductAnalytics[];
  currencySymbol?: string;
}

export const TopProductsLeaderboard: React.FC<TopProductsLeaderboardProps> = ({
  products,
  currencySymbol = "₹",
}) => {
  if (!products || products.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Trophy size={16} color={Colors.warning} />
            <Text style={styles.title}>Top Performing Products</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Package size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No product sales recorded in this timeframe.</Text>
        </View>
      </Card>
    );
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Trophy size={16} color={Colors.warning} />
          <Text style={styles.title}>Top Performing Products</Text>
        </View>
        <Text style={styles.countBadge}>{products.length} items</Text>
      </View>

      {/* Leaderboard List */}
      <View style={styles.list}>
        {products.map((prod, index) => {
          const rank = index + 1;
          const sharePercent = Math.min(100, Math.round((prod.revenue / maxRevenue) * 100));

          return (
            <View key={prod.productId || index} style={styles.itemRow}>
              {/* Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  rank === 1 && styles.rankGold,
                  rank === 2 && styles.rankSilver,
                  rank === 3 && styles.rankBronze,
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    rank <= 3 && styles.rankTextHighlight,
                  ]}
                >
                  #{rank}
                </Text>
              </View>

              {/* Product Info & Bar */}
              <View style={styles.itemBody}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {prod.name}
                  </Text>
                  <Text style={styles.revenueText}>
                    {currencySymbol}
                    {Number(prod.revenue).toLocaleString("en-IN")}
                  </Text>
                </View>

                {/* Units sold & Progress bar */}
                <View style={styles.itemBottomRow}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${sharePercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.unitsSoldText}>
                    {prod.unitsSold} sold
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
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
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  countBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  rankGold: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  rankSilver: {
    backgroundColor: "rgba(165, 178, 209, 0.15)",
    borderColor: "rgba(165, 178, 209, 0.4)",
  },
  rankBronze: {
    backgroundColor: "rgba(180, 83, 9, 0.15)",
    borderColor: "rgba(180, 83, 9, 0.4)",
  },
  rankText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  rankTextHighlight: {
    color: Colors.white,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  revenueText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  itemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  unitsSoldText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

