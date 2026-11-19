// apps/mobile/src/features/customers/CustomerDetailScreen.tsx
// Comprehensive customer profile and order history screen for LaunchCommerce merchants

import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { EmptyState } from "../../components/common/EmptyState";
import { CustomerDetailSkeleton } from "../../components/common/LoadingSkeleton";
import { CustomerActionButtons } from "../../components/customers/CustomerActionButtons";
import { useCustomerDetails } from "../../hooks/use-customers";
import { CustomerOrderSummary } from "../../types";

function getInitials(name?: string): string {
  if (!name || !name.trim()) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

function getStatusVariant(status: string): "muted" | "success" | "warning" | "danger" | "info" {
  switch (status.toUpperCase()) {
    case "DELIVERED":
    case "PAID":
      return "success";
    case "PROCESSING":
    case "SHIPPED":
    case "CONFIRMED":
      return "info";
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "FAILED":
      return "danger";
    default:
      return "muted";
  }
}

export const CustomerDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const customerId = params.id;

  const {
    customer,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCustomerDetails(customerId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Profile</Text>
        </View>
        <CustomerDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !customer) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Profile</Text>
        </View>
        <View style={styles.centerContainer}>
          <EmptyState
            title="Customer Not Found"
            description={error || "Could not retrieve the customer record from the server."}
            icon={<AlertCircle size={48} color={Colors.danger} />}
            actionTitle="Try Again"
            onAction={() => {
              refetch();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(customer.name);
  const totalOrders = customer.totalOrders || 0;
  const totalSpent = Number(customer.totalSpent) || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
  const orders: CustomerOrderSummary[] = customer.orders || [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{initials}</Text>
          </View>

          <Text style={styles.customerName}>{customer.name || "Customer"}</Text>

          <View style={styles.metaRow}>
            <Calendar size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>
              Member since {formatDate(customer.createdAt)}
            </Text>
          </View>

          {/* Contact Details List */}
          <View style={styles.contactDetailsContainer}>
            {customer.email ? (
              <View style={styles.contactRow}>
                <View style={styles.iconCircle}>
                  <Mail size={14} color={Colors.primary} />
                </View>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {customer.email}
                </Text>
              </View>
            ) : null}

            {customer.phone ? (
              <View style={styles.contactRow}>
                <View style={styles.iconCircle}>
                  <Phone size={14} color="#22C55E" />
                </View>
                <Text style={styles.contactValue}>
                  {customer.phone}
                </Text>
              </View>
            ) : null}

            {customer.address ? (
              <View style={styles.contactRow}>
                <View style={styles.iconCircle}>
                  <MapPin size={14} color={Colors.warning} />
                </View>
                <Text style={styles.contactValue}>
                  {customer.address}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Quick Actions (Call, WhatsApp, Email) */}
          <CustomerActionButtons
            name={customer.name}
            phone={customer.phone}
            email={customer.email}
            size="full"
          />
        </Card>

        {/* Spend & Order KPI Statistics */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <StatCard
              label="Total Spent"
              value={`₹${totalSpent.toLocaleString("en-IN")}`}
              icon={<IndianRupee size={16} color={Colors.primary} />}
            />
          </View>
          <View style={styles.kpiCol}>
            <StatCard
              label="Total Orders"
              value={totalOrders}
              icon={<ShoppingBag size={16} color={Colors.info} />}
              variant="info"
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <StatCard
              label="Avg Order Value"
              value={`₹${avgOrderValue.toLocaleString("en-IN")}`}
              icon={<TrendingUp size={16} color={Colors.success} />}
              variant="success"
            />
          </View>
          <View style={styles.kpiCol}>
            <StatCard
              label="Last Order"
              value={customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "None"}
              icon={<Clock size={16} color={Colors.warning} />}
              variant="warning"
            />
          </View>
        </View>

        {/* Order History Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <ShoppingBag size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Order History</Text>
          </View>
          <Badge label={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`} variant="muted" size="sm" />
        </View>

        {orders.length === 0 ? (
          <Card style={styles.emptyOrdersCard}>
            <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
            <Text style={styles.emptyOrdersSubtitle}>
              This customer has not placed any orders through your storefront.
            </Text>
          </Card>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderId} numberOfLines={1}>
                      Order #{order.id.slice(-8).toUpperCase()}
                    </Text>
                    <View style={styles.orderDateRow}>
                      <Clock size={11} color={Colors.textMuted} />
                      <Text style={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.orderAmount}>
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.orderFooter}>
                  <Badge
                    label={order.status}
                    variant={getStatusVariant(order.status)}
                    size="sm"
                  />
                  <Badge
                    label={order.paymentStatus}
                    variant={getStatusVariant(order.paymentStatus)}
                    size="sm"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Informational API Note */}
        <View style={styles.apiNoticeCard}>
          <Info size={16} color={Colors.textMuted} style={styles.apiNoticeIcon} />
          <Text style={styles.apiNoticeText}>
            Customer accounts and passwords are self-managed by shoppers on your storefront. The existing LaunchCommerce REST API operates in read-only mode for customer profiles.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primaryText,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  contactDetailsContainer: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  contactValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiCol: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyOrdersCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyOrdersTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyOrdersSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
  },
  ordersList: {
    gap: 10,
  },
  orderCard: {
    padding: 14,
    gap: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  orderDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primaryText,
  },
  orderFooter: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  apiNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(32, 45, 85, 0.4)",
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    gap: 8,
  },
  apiNoticeIcon: {
    marginTop: 2,
  },
  apiNoticeText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    flex: 1,
  },
});
