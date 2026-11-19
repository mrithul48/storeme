// apps/mobile/app/(app)/(tabs)/index.tsx
// Comprehensive LaunchCommerce Merchant Dashboard with real-time KPIs, low-stock alerts, and recent orders

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../../../src/constants/theme";
import { Card } from "../../../src/components/common/Card";
import { StatCard } from "../../../src/components/common/StatCard";
import { Badge } from "../../../src/components/common/Badge";
import { Button } from "../../../src/components/common/Button";
import {
  Boxes,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowRight,
} from "lucide-react-native";
import { useAuthStore } from "../../../src/stores/auth-store";
import {
  useStoreStats,
  useOrdersSummary,
  useAnalytics,
} from "../../../src/hooks/use-analytics";
import { useRecentOrders } from "../../../src/hooks/use-orders";
import { useInventory } from "../../../src/hooks/use-inventory";
import { AnalyticsTimeframe } from "../../../src/types";

const TIMEFRAME_OPTIONS: Array<{ key: AnalyticsTimeframe; label: string }> = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "1y", label: "1Y" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const store = useAuthStore((state) => state.store);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");

  const { data: stats, isLoading: isStatsLoading, isRefetching: isStatsRefetching, refetch: refetchStats } =
    useStoreStats();
  const { data: ordersSummary, refetch: refetchOrders } = useOrdersSummary();
  const { data: recentOrders = [], refetch: refetchRecent } = useRecentOrders();
  const { summary: inventorySummary, refetch: refetchInventory } = useInventory({ threshold: 5 });
  const { data: analyticsData, refetch: refetchAnalytics } = useAnalytics(timeframe);

  const isRefreshing = isStatsRefetching;

  const handleRefresh = async () => {
    await Promise.all([
      refetchStats(),
      refetchOrders(),
      refetchRecent(),
      refetchInventory(),
      refetchAnalytics(),
    ]);
  };

  const lowStockCount = inventorySummary?.lowStockCount || 0;
  const outOfStockCount = inventorySummary?.outOfStockCount || 0;
  const totalStockAttention = lowStockCount + outOfStockCount;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primaryText}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header with Store Name & Timeframe Selector */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Merchant Dashboard</Text>
            <Text style={styles.subtitle}>{store?.name || "LaunchCommerce Store"}</Text>
          </View>

          <View style={styles.timeframePills}>
            {TIMEFRAME_OPTIONS.map((t) => {
              const active = timeframe === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTimeframe(t.key)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Low-Stock Attention Alert Banner */}
        {totalStockAttention > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(app)/(tabs)/more/inventory" as any)}
          >
            <Card style={styles.alertCard}>
              <View style={styles.alertIconWrapper}>
                <AlertTriangle size={18} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Inventory Attention Needed</Text>
                <Text style={styles.alertDesc}>
                  {outOfStockCount > 0
                    ? `${outOfStockCount} items out of stock, ${lowStockCount} items low.`
                    : `${lowStockCount} items running low on stock.`}
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.warning} />
            </Card>
          </TouchableOpacity>
        )}

        {/* 2x2 Primary KPI Metric Tiles */}
        <View style={styles.kpiGrid}>
          <StatCard
            label="Total Revenue"
            value={`₹${(stats?.revenue || analyticsData?.metrics?.totalRevenue || 0).toLocaleString("en-IN")}`}
            subtext="Gross store revenue"
            icon={<DollarSign size={16} color={Colors.success} />}
            variant="success"
          />
          <StatCard
            label="Total Orders"
            value={stats?.totalOrders || ordersSummary?.totalOrders || 0}
            subtext={`${ordersSummary?.pendingOrders || 0} pending fulfillment`}
            icon={<ShoppingBag size={16} color={Colors.primaryText} />}
            variant="primary"
          />
          <StatCard
            label="Catalog Products"
            value={stats?.totalProducts || 0}
            subtext={`${stats?.activeProducts || 0} active, ${lowStockCount} low`}
            icon={<Package size={16} color={Colors.info} />}
            variant="info"
          />
          <StatCard
            label="Registered Customers"
            value={stats?.totalCustomers || 0}
            subtext="Active buyers database"
            icon={<Users size={16} color={Colors.warning} />}
            variant="warning"
          />
        </View>

        {/* Recent Orders Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/orders" as any)}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <ArrowRight size={14} color={Colors.primaryText} />
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <Card style={styles.emptyRecentCard}>
            <ShoppingBag size={24} color={Colors.textMuted} />
            <Text style={styles.emptyRecentText}>No recent orders recorded yet.</Text>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            {recentOrders.slice(0, 5).map((order, idx) => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.7}
                onPress={() => router.push("/(app)/(tabs)/orders" as any)}
                style={[
                  styles.recentOrderItem,
                  idx > 0 && styles.recentOrderItemBorder,
                ]}
              >
                <View style={styles.recentOrderInfo}>
                  <Text style={styles.recentOrderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.recentOrderCustomer}>
                    {order.customer?.name || "Customer"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={styles.recentOrderTotal}>
                    ₹{(order.total || 0).toLocaleString("en-IN")}
                  </Text>
                  <Badge
                    label={order.status}
                    variant={
                      order.status === "DELIVERED"
                        ? "success"
                        : order.status === "CANCELLED"
                        ? "danger"
                        : order.status === "PENDING"
                        ? "warning"
                        : "primary"
                    }
                    size="sm"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Quick Action Navigation Shortcuts */}
        <Text style={styles.sectionTitle}>Operations Shortcuts</Text>
        <View style={styles.actionCardsSection}>
          {/* Inventory Banner Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(app)/(tabs)/more/inventory" as any)}
          >
            <Card style={styles.actionCard}>
              <View style={[styles.actionIconBadge, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
                <Boxes size={22} color={Colors.success} />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Inventory Management</Text>
                <Text style={styles.actionCardDesc}>
                  Adjust stock levels, replenish units, and configure color variants.
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Card>
          </TouchableOpacity>

          {/* Customers Banner Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(app)/(tabs)/more/customers" as any)}
          >
            <Card style={styles.actionCard}>
              <View style={[styles.actionIconBadge, { backgroundColor: "rgba(234, 179, 8, 0.15)" }]}>
                <Users size={22} color={Colors.warning} />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Customers Database</Text>
                <Text style={styles.actionCardDesc}>
                  View buyer profiles, purchase history, and quick call/WhatsApp contact.
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Card>
          </TouchableOpacity>

          {/* Analytics Banner Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(app)/(tabs)/analytics" as any)}
          >
            <Card style={styles.actionCard}>
              <View style={[styles.actionIconBadge, { backgroundColor: "rgba(99, 139, 255, 0.15)" }]}>
                <TrendingUp size={22} color={Colors.primaryText} />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Store Analytics & Trends</Text>
                <Text style={styles.actionCardDesc}>
                  View sales trends, top performing products, and channel breakdown.
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeframePills: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.white,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderColor: "rgba(234, 179, 8, 0.3)",
    marginBottom: 16,
    gap: 12,
  },
  alertIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.warning,
  },
  alertDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  emptyRecentCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  emptyRecentText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  recentOrderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
  },
  recentOrderItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  recentOrderInfo: {
    flex: 1,
  },
  recentOrderNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  recentOrderCustomer: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentOrderTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionCardsSection: {
    gap: 12,
    marginTop: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.surface,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionCardContent: {
    flex: 1,
    paddingRight: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionCardDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
