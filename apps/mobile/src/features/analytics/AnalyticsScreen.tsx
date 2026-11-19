// apps/mobile/src/features/analytics/AnalyticsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RotateCcw,
  Calendar,
  AlertTriangle,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/LoadingSkeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { AnalyticsChart } from "../../components/analytics/AnalyticsChart";
import { TopProductsLeaderboard } from "../../components/analytics/TopProductsLeaderboard";
import { ChannelBreakdownCard } from "../../components/analytics/ChannelBreakdownCard";
import { OrderLifecycleCard } from "../../components/analytics/OrderLifecycleCard";
import { InventoryInsightsCard } from "../../components/analytics/InventoryInsightsCard";
import { useAnalytics, useStoreStats, useOrdersSummary } from "../../hooks/use-analytics";
import { useAuthStore } from "../../stores/auth-store";
import { AnalyticsTimeframe } from "../../types";

const TIMEFRAME_OPTIONS: Array<{ key: AnalyticsTimeframe; label: string }> = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "1y", label: "1 Year" },
];

export const AnalyticsScreen: React.FC = () => {
  const store = useAuthStore((state) => state.store);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");

  // Parallel API queries
  const analyticsQuery = useAnalytics(timeframe);
  const storeStatsQuery = useStoreStats();
  const ordersSummaryQuery = useOrdersSummary();

  const isRefreshing =
    analyticsQuery.isRefetching ||
    storeStatsQuery.isRefetching ||
    ordersSummaryQuery.isRefetching;

  const handleRefresh = async () => {
    await Promise.all([
      analyticsQuery.refetch(),
      storeStatsQuery.refetch(),
      ordersSummaryQuery.refetch(),
    ]);
  };

  const analytics = analyticsQuery.data;
  const storeStats = storeStatsQuery.data;
  const ordersSummary = ordersSummaryQuery.data || null;

  const isLoading = analyticsQuery.isLoading || storeStatsQuery.isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.storeName}>
            {store?.name ? store.name : "Merchant Store"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRefresh}
          style={styles.refreshIconBtn}
        >
          <RotateCcw size={16} color={Colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Timeframe Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.timeframeTabs}>
          {TIMEFRAME_OPTIONS.map((opt) => {
            const isActive = timeframe === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.7}
                onPress={() => setTimeframe(opt.key)}
                style={[
                  styles.timeframeBtn,
                  isActive && styles.timeframeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    isActive && styles.timeframeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonRow}>
              <Skeleton width="48%" height={88} borderRadius={16} />
              <Skeleton width="48%" height={88} borderRadius={16} />
            </View>
            <View style={styles.skeletonRow}>
              <Skeleton width="48%" height={88} borderRadius={16} />
              <Skeleton width="48%" height={88} borderRadius={16} />
            </View>
            <Skeleton width="100%" height={220} borderRadius={16} style={{ marginTop: 12 }} />
            <Skeleton width="100%" height={160} borderRadius={16} style={{ marginTop: 12 }} />
          </View>
        ) : analyticsQuery.isError ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={36} color={Colors.danger} style={{ marginBottom: 10 }} />
            <Text style={styles.errorTitle}>Failed to Load Analytics</Text>
            <Text style={styles.errorDesc}>
              {analyticsQuery.error instanceof Error
                ? analyticsQuery.error.message
                : "Unable to retrieve analytics data from backend."}
            </Text>
            <Button
              title="Try Again"
              variant="primary"
              size="sm"
              onPress={handleRefresh}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : !analytics?.hasOrders && (ordersSummary?.totalOrders || 0) === 0 ? (
          <EmptyState
            title="No Store Orders Yet"
            description="Analytics will automatically populate as your customers begin placing orders."
            icon={<TrendingUp size={36} color={Colors.primaryText} />}
          />
        ) : (
          <>
            {/* Primary KPI Grid (2x2) */}
            <View style={styles.kpiGrid}>
              <StatCard
                label="Total Revenue"
                value={`₹${(analytics?.metrics.totalRevenue || storeStats?.revenue || 0).toLocaleString("en-IN")}`}
                subtext={`In the selected ${timeframe}`}
                icon={<DollarSign size={16} color={Colors.success} />}
                variant="success"
              />
              <StatCard
                label="Orders Placed"
                value={analytics?.metrics.totalOrders || 0}
                subtext={`${analytics?.metrics.deliveredOrders || 0} delivered`}
                icon={<ShoppingBag size={16} color={Colors.primaryText} />}
                variant="primary"
              />
              <StatCard
                label="Avg Order Value"
                value={`₹${(analytics?.metrics.averageOrderValue || 0).toLocaleString("en-IN")}`}
                subtext="Per paid order"
                icon={<TrendingUp size={16} color={Colors.info} />}
                variant="info"
              />
              <StatCard
                label="Total Customers"
                value={storeStats?.totalCustomers || 0}
                subtext="Registered buyers"
                icon={<Users size={16} color={Colors.warning} />}
                variant="warning"
              />
            </View>

            {/* Revenue & Orders Trend Area/Line Chart */}
            {analytics?.salesOverTime && analytics.salesOverTime.length > 0 && (
              <AnalyticsChart data={analytics.salesOverTime} currencySymbol="₹" />
            )}

            {/* Top Performing Products Leaderboard */}
            <TopProductsLeaderboard
              products={analytics?.topProducts || []}
              currencySymbol="₹"
            />

            {/* Order Channel Breakdown */}
            {analytics?.channels && (
              <ChannelBreakdownCard channels={analytics.channels} />
            )}

            {/* Order Lifecycle Statuses */}
            <OrderLifecycleCard summary={ordersSummary} />

            {/* Inventory Stock Health Insights */}
            <InventoryInsightsCard />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  storeName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  timeframeTabs: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 4,
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  timeframeBtnActive: {
    backgroundColor: Colors.primary,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  timeframeTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  skeletonContainer: {
    gap: 10,
    paddingTop: 8,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  errorDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});

