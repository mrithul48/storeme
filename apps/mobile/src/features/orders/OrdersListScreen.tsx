// apps/mobile/src/features/orders/OrdersListScreen.tsx
// Comprehensive order fulfillment, tracking, and customer contact management

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ShoppingBag,
  Search,
  X,
  Phone,
  Mail,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  MapPin,
  CreditCard,
  RotateCcw,
  ChevronRight,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/LoadingSkeleton";
import { useOrders, useUpdateOrderStatus } from "../../hooks/use-orders";
import { useAuthStore } from "../../stores/auth-store";
import {
  handleCallCustomer,
  handleEmailCustomer,
  handleWhatsAppCustomer,
} from "../../components/customers/customer-actions";
import { Order, OrderStatus } from "../../types";

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const OrdersListScreen: React.FC = () => {
  const store = useAuthStore((state) => state.store);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  const {
    data: ordersData,
    isLoading,
    isRefetching,
    refetch,
  } = useOrders({
    search: search.trim() || undefined,
    status: activeFilter === "ALL" ? undefined : activeFilter,
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const orders = ordersData?.data || [];

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setStatusUpdateError(null);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setStatusUpdateError(null);

    try {
      const updated = await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        payload: { status: newStatus },
      });
      setSelectedOrder(updated);
    } catch (err: any) {
      setStatusUpdateError(
        err?.message || "Failed to update order status. Please try again."
      );
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "CONFIRMED":
      case "PROCESSING":
      case "SHIPPED":
        return "primary";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "muted";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Orders Fulfillment</Text>
          <Text style={styles.storeName}>{store?.name || "Merchant Store"}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            refetch();
          }}
          style={styles.refreshBtn}
        >
          <RotateCcw size={16} color={Colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search by order number or customer name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Horizontal Status Filter Tabs */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {STATUS_FILTERS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(tab.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={styles.skeletonCard}>
              <View style={{ gap: 8 }}>
                <Skeleton width="50%" height={16} borderRadius={4} />
                <Skeleton width="80%" height={14} borderRadius={4} />
                <Skeleton width="40%" height={12} borderRadius={4} />
              </View>
            </Card>
          ))}
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description={
            search
              ? `No orders matched "${search}".`
              : activeFilter !== "ALL"
              ? `No ${activeFilter.toLowerCase()} orders at the moment.`
              : "When customers place orders, they will appear here in real-time."
          }
          icon={<ShoppingBag size={40} color={Colors.primaryText} />}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => {
            const orderDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const itemCount =
              item.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) ||
              item.items?.length ||
              1;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openOrderDetail(item)}
              >
                <Card style={styles.orderCard}>
                  {/* Order Top Bar: Order Number, Date, Status */}
                  <View style={styles.orderTopBar}>
                    <View>
                      <Text style={styles.orderNumber}>
                        #{item.orderNumber}
                      </Text>
                      <Text style={styles.orderDate}>{orderDate}</Text>
                    </View>
                    <Badge
                      label={item.status}
                      variant={getStatusBadgeVariant(item.status)}
                      size="sm"
                    />
                  </View>

                  <View style={styles.divider} />

                  {/* Customer and Items Summary */}
                  <View style={styles.orderCustomerRow}>
                    <View style={styles.customerAvatar}>
                      <User size={14} color={Colors.primaryText} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName}>
                        {item.customer?.name || "Guest Buyer"}
                      </Text>
                      <Text style={styles.orderChannelText}>
                        via {item.orderChannel || "Storefront"} • {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                      </Text>
                    </View>

                    {/* Total Amount & Payment Badge */}
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.orderTotal}>
                        ₹{(item.total || 0).toLocaleString("en-IN")}
                      </Text>
                      <Badge
                        label={item.paymentStatus || "PENDING"}
                        variant={
                          item.paymentStatus === "PAID"
                            ? "success"
                            : item.paymentStatus === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Order Details & Status Updater Modal */}
      <Modal
        visible={isDetailModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalOpen(false)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Order #{selectedOrder?.orderNumber}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedOrder?.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN")
                    : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDetailModalOpen(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {statusUpdateError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{statusUpdateError}</Text>
              </View>
            )}

            <ScrollView
              contentContainerStyle={styles.detailScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Order Status Transition Section */}
              <Text style={styles.sectionHeading}>Update Fulfillment Status</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statusChipsRow}
              >
                {ALL_ORDER_STATUSES.map((st) => {
                  const isCurrent = selectedOrder?.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.7}
                      disabled={updateStatusMutation.isPending}
                      onPress={() => handleUpdateStatus(st)}
                      style={[
                        styles.statusPickerChip,
                        isCurrent && styles.statusPickerChipActive,
                      ]}
                    >
                      {updateStatusMutation.isPending && isCurrent ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text
                          style={[
                            styles.statusPickerText,
                            isCurrent && styles.statusPickerTextActive,
                          ]}
                        >
                          {st}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Customer Information & Quick Actions */}
              <Text style={styles.sectionHeading}>Customer & Contact</Text>
              <Card style={styles.customerContactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.avatarLarge}>
                    <User size={20} color={Colors.primaryText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailCustomerName}>
                      {selectedOrder?.customer?.name || "Guest Customer"}
                    </Text>
                    {selectedOrder?.customer?.phone && (
                      <Text style={styles.detailPhone}>
                        {selectedOrder.customer.phone}
                      </Text>
                    )}
                    {selectedOrder?.customer?.email && (
                      <Text style={styles.detailEmail}>
                        {selectedOrder.customer.email}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Quick Action Dial Buttons */}
                <View style={styles.quickActionButtons}>
                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() =>
                      handleCallCustomer(
                        selectedOrder?.customer?.phone || selectedOrder?.shippingAddress?.phone,
                        selectedOrder?.customer?.name
                      )
                    }
                  >
                    <Phone size={16} color={Colors.primaryText} />
                    <Text style={styles.quickActionLabel}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() =>
                      handleWhatsAppCustomer(
                        selectedOrder?.customer?.phone || selectedOrder?.shippingAddress?.phone,
                        selectedOrder?.customer?.name
                      )
                    }
                  >
                    <MessageCircle size={16} color={Colors.success} />
                    <Text style={[styles.quickActionLabel, { color: Colors.success }]}>
                      WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() =>
                      handleEmailCustomer(
                        selectedOrder?.customer?.email,
                        selectedOrder?.customer?.name
                      )
                    }
                  >
                    <Mail size={16} color={Colors.info} />
                    <Text style={[styles.quickActionLabel, { color: Colors.info }]}>
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>

              {/* Shipping Address */}
              <Text style={styles.sectionHeading}>Delivery Address</Text>
              <Card style={styles.addressCard}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <MapPin size={18} color={Colors.textMuted} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressName}>
                      {selectedOrder?.shippingAddress?.name ||
                        selectedOrder?.customer?.name ||
                        "Recipient"}
                    </Text>
                    <Text style={styles.addressLine}>
                      {selectedOrder?.shippingAddress?.address || "Address not provided"}
                    </Text>
                    <Text style={styles.addressCity}>
                      {[
                        selectedOrder?.shippingAddress?.city,
                        selectedOrder?.shippingAddress?.state,
                        selectedOrder?.shippingAddress?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Order Items */}
              <Text style={styles.sectionHeading}>
                Items ({selectedOrder?.items?.length || 0})
              </Text>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                {(selectedOrder?.items || []).map((it, idx) => (
                  <View
                    key={it.id || idx}
                    style={[
                      styles.orderItemRow,
                      idx > 0 && styles.orderItemBorder,
                    ]}
                  >
                    <View style={styles.itemIconBadge}>
                      <ShoppingBag size={16} color={Colors.primaryText} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{it.productName}</Text>
                      {it.variantColor ? (
                        <Text style={styles.itemVariant}>
                          Color: {it.variantColor}
                        </Text>
                      ) : null}
                      <Text style={styles.itemQtyPrice}>
                        {it.quantity} × ₹{it.price.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <Text style={styles.itemSubtotal}>
                      ₹{(it.subtotal || it.price * it.quantity).toLocaleString("en-IN")}
                    </Text>
                  </View>
                ))}
              </Card>

              {/* Financial Breakdown */}
              <Text style={styles.sectionHeading}>Payment Summary</Text>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(selectedOrder?.subtotal || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping Charge</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(selectedOrder?.shippingCharge || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                  <Text style={styles.summaryTotalLabel}>Grand Total</Text>
                  <Text style={styles.summaryTotalValue}>
                    ₹{(selectedOrder?.total || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.paymentMethodRow}>
                  <CreditCard size={14} color={Colors.textMuted} />
                  <Text style={styles.paymentMethodText}>
                    Payment: {selectedOrder?.paymentMethod || selectedOrder?.orderChannel || "COD"} (
                    {selectedOrder?.paymentStatus || "PENDING"})
                  </Text>
                </View>
              </Card>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  storeName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterScrollWrapper: {
    marginBottom: 12,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  skeletonCard: {
    padding: 16,
  },
  orderCard: {
    padding: 14,
    backgroundColor: Colors.surface,
  },
  orderTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  orderCustomerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  orderChannelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  detailScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  statusChipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  statusPickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
    alignItems: "center",
  },
  statusPickerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusPickerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusPickerTextActive: {
    color: Colors.white,
  },
  customerContactCard: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCustomerName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  detailPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  quickActionButtons: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  addressCard: {
    padding: 14,
    backgroundColor: Colors.surface,
  },
  addressName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressCity: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  orderItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  itemVariant: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  itemQtyPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  summaryCard: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primaryText,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  paymentMethodText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
});

