// apps/mobile/src/components/analytics/InventoryInsightsCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Boxes, AlertTriangle, XCircle, CheckCircle2, ChevronRight } from "lucide-react-native";
import { Card } from "../common/Card";
import { Colors } from "../../constants/theme";
import { useInventory } from "../../hooks/use-inventory";

export const InventoryInsightsCard: React.FC = () => {
  const router = useRouter();
  const { summary, isLoading } = useInventory({ limit: 100 });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Boxes size={16} color={Colors.primaryText} />
          <Text style={styles.title}>Inventory Stock Health</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(app)/(tabs)/more/inventory" as any)}
          style={styles.manageBtn}
        >
          <Text style={styles.manageText}>Manage</Text>
          <ChevronRight size={13} color={Colors.primaryText} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {/* Total Stock */}
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Total Units</Text>
          <Text style={styles.statVal}>{summary.totalStockUnits}</Text>
          <Text style={styles.statSub}>{summary.totalProducts} products</Text>
        </View>

        {/* Low Stock */}
        <View style={[styles.statTile, styles.tileWarning]}>
          <View style={styles.iconRow}>
            <AlertTriangle size={12} color={Colors.warning} />
            <Text style={[styles.statLabel, { color: Colors.warning }]}>Low Stock</Text>
          </View>
          <Text style={[styles.statVal, { color: Colors.warning }]}>{summary.lowStockCount}</Text>
          <Text style={styles.statSub}>Reorder soon</Text>
        </View>

        {/* Out of Stock */}
        <View style={[styles.statTile, styles.tileDanger]}>
          <View style={styles.iconRow}>
            <XCircle size={12} color={Colors.danger} />
            <Text style={[styles.statLabel, { color: Colors.danger }]}>Out of Stock</Text>
          </View>
          <Text style={[styles.statVal, { color: Colors.danger }]}>{summary.outOfStockCount}</Text>
          <Text style={styles.statSub}>Replenish</Text>
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
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  manageText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  tileWarning: {
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warningBorder,
  },
  tileDanger: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});

