// apps/mobile/src/features/inventory/InventoryScreen.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowUpDown,
  Filter,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { StatCard } from "../../components/common/StatCard";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { InventoryListSkeleton } from "../../components/common/LoadingSkeleton";
import { Button } from "../../components/common/Button";
import { InventoryCard } from "../../components/inventory/InventoryCard";
import { StockAdjustModal } from "../../components/inventory/StockAdjustModal";
import { useInventory } from "../../hooks/use-inventory";
import { useAuthStore } from "../../stores/auth-store";
import { InventoryItem } from "../../types";

type FilterTab = "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK";

const THRESHOLD = 5;

export const InventoryScreen: React.FC = () => {
  const store = useAuthStore((state) => state.store);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  // Selected item & variant for the adjustment modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch inventory from NestJS backend
  const {
    items,
    summary,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useInventory({
    search: search.trim() || undefined,
    threshold: THRESHOLD,
  });

  // Client-side quick filter tabs
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isOut = item.stock <= 0 || !item.inStock;
      const isLow = !isOut && item.stock <= THRESHOLD && item.manageStockQuantity;
      const isIn = !isOut && !isLow;

      if (activeTab === "LOW_STOCK") return isLow;
      if (activeTab === "OUT_OF_STOCK") return isOut;
      if (activeTab === "IN_STOCK") return isIn;
      return true;
    });
  }, [items, activeTab]);

  const handleOpenAdjust = (item: InventoryItem, variantId?: string) => {
    setSelectedItem(item);
    setSelectedVariantId(variantId);
    setModalVisible(true);
  };

  const handleAdjustSuccess = () => {
    setSuccessToast("Stock updated successfully!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.storeName}>
            {store?.name ? store.name : "Merchant Store"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => refetch()}
          style={styles.refreshIconBtn}
        >
          <ArrowUpDown size={16} color={Colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Success Notification Banner */}
      {successToast && (
        <View style={styles.toast}>
          <CheckCircle2 size={16} color={Colors.success} />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* KPI Overview Summary (Horizontal scrollable cards) */}
      <View style={styles.kpiContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScrollContent}
        >
          <StatCard
            label="Total Products"
            value={summary.totalProducts}
            subtext={`${summary.totalStockUnits} total units`}
            icon={<Package size={16} color={Colors.primaryText} />}
          />
          <StatCard
            label="In Stock"
            value={summary.inStockCount}
            variant="success"
            subtext="Available for sale"
            icon={<CheckCircle2 size={16} color={Colors.success} />}
          />
          <StatCard
            label="Low Stock"
            value={summary.lowStockCount}
            variant="warning"
            subtext={`<= ${THRESHOLD} units remaining`}
            icon={<AlertTriangle size={16} color={Colors.warning} />}
          />
          <StatCard
            label="Out of Stock"
            value={summary.outOfStockCount}
            variant="danger"
            subtext="Needs replenishment"
            icon={<XCircle size={16} color={Colors.danger} />}
          />
        </ScrollView>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by product name or SKU..."
        />
      </View>

      {/* Quick Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {[
            { key: "ALL", label: `All (${items.length})` },
            { key: "LOW_STOCK", label: `Low Stock (${summary.lowStockCount})` },
            { key: "OUT_OF_STOCK", label: `Out of Stock (${summary.outOfStockCount})` },
            { key: "IN_STOCK", label: `In Stock (${summary.inStockCount})` },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key as FilterTab)}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <InventoryListSkeleton />
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={40} color={Colors.danger} style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Failed to Load Inventory</Text>
          <Text style={styles.errorDesc}>
            {error instanceof Error ? error.message : "Unable to reach the NestJS API."}
          </Text>
          <Button
            title="Retry"
            variant="primary"
            size="sm"
            onPress={() => refetch()}
            style={{ marginTop: 12 }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              threshold={THRESHOLD}
              onAdjustStock={handleOpenAdjust}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={Colors.primaryText}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={
                search.trim()
                  ? "No matching products"
                  : activeTab !== "ALL"
                  ? `No ${activeTab.replace("_", " ").toLowerCase()} products`
                  : "No inventory items"
              }
              description={
                search.trim()
                  ? `No products found matching "${search}". Try checking the spelling.`
                  : activeTab !== "ALL"
                  ? "All your products are in healthy inventory ranges for this filter."
                  : "Add products from your catalog to start tracking and managing inventory."
              }
              actionTitle={search.trim() || activeTab !== "ALL" ? "Clear Filters" : undefined}
              onAction={() => {
                setSearch("");
                setActiveTab("ALL");
              }}
            />
          }
        />
      )}

      {/* Stock Adjustment Bottom Sheet Modal */}
      <StockAdjustModal
        visible={modalVisible}
        item={selectedItem}
        selectedVariantId={selectedVariantId}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
          setSelectedVariantId(undefined);
        }}
        onSuccess={handleAdjustSuccess}
      />
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
    paddingBottom: 12,
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
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: "600",
  },
  kpiContainer: {
    marginBottom: 12,
  },
  kpiScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});

