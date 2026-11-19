// apps/mobile/src/features/customers/CustomersListScreen.tsx
// Comprehensive customer database and directory for LaunchCommerce merchants

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Users,
  Search,
  ShoppingBag,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { StatCard } from "../../components/common/StatCard";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { CustomerListSkeleton } from "../../components/common/LoadingSkeleton";
import { Button } from "../../components/common/Button";
import { CustomerCard } from "../../components/customers/CustomerCard";
import { useCustomers } from "../../hooks/use-customers";
import { useAuthStore } from "../../stores/auth-store";
import { CustomerListItem } from "../../types";

export const CustomersListScreen: React.FC = () => {
  const router = useRouter();
  const store = useAuthStore((state) => state.store);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch customers from NestJS backend
  const {
    customers,
    pagination,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useCustomers({
    page,
    limit: 20,
    search: debouncedSearch.trim() || undefined,
  });

  // Calculate quick metrics for current view
  const repeatBuyerCount = useMemo(() => {
    return customers.filter((c) => c.totalOrders > 1).length;
  }, [customers]);

  const totalSpentInBatch = useMemo(() => {
    return customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
  }, [customers]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <View style={styles.headerBadgeRow}>
              <Text style={styles.title}>Customers</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{pagination.total}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{store?.name || "Merchant Store"}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search by name, email, or mobile..."
          />
        </View>
      </View>

      {/* KPI Stats Strip */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <StatCard
            label="Total Customers"
            value={pagination.total}
            icon={<Users size={16} color={Colors.primary} />}
          />
        </View>
        <View style={styles.statCol}>
          <StatCard
            label="Repeat Buyers"
            value={repeatBuyerCount}
            icon={<TrendingUp size={16} color={Colors.success} />}
            variant="success"
          />
        </View>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <CustomerListSkeleton />
      ) : error ? (
        <View style={styles.errorContainer}>
          <EmptyState
            title="Failed to Load Customers"
            description={error}
            icon={<Users size={48} color={Colors.danger} />}
            actionTitle="Try Again"
            onAction={() => {
              refetch();
            }}
          />
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title={debouncedSearch ? "No Matching Customers" : "No Customers Yet"}
            description={
              debouncedSearch
                ? `No customers matched "${debouncedSearch}". Try a different name, email, or phone number.`
                : "Customers will automatically appear here once shoppers register or place orders in your storefront."
            }
            icon={<Users size={48} color={Colors.primary} />}
            actionTitle={debouncedSearch ? "Clear Search" : undefined}
            onAction={debouncedSearch ? () => setSearchInput("") : undefined}
          />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => {
                router.push(`/(app)/(tabs)/more/customers/${item.id}` as any);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListFooterComponent={
            pagination.totalPages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    !pagination.hasPrev && styles.pageButtonDisabled,
                  ]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  activeOpacity={0.7}
                >
                  <ChevronLeft
                    size={16}
                    color={pagination.hasPrev ? Colors.textPrimary : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.pageButtonText,
                      !pagination.hasPrev && styles.pageButtonTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                  Page {pagination.page} of {pagination.totalPages}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    !pagination.hasNext && styles.pageButtonDisabled,
                  ]}
                  onPress={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      !pagination.hasNext && styles.pageButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <ChevronRight
                    size={16}
                    color={pagination.hasNext ? Colors.textPrimary : Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCol: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  pageButtonTextDisabled: {
    color: Colors.textMuted,
  },
  pageIndicator: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
