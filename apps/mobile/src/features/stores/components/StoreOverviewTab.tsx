// apps/mobile/src/features/stores/components/StoreOverviewTab.tsx
// Read-only overview of store details, settings summary, and subscription status

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Building2,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Layers,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Globe,
  Sparkles,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { StoreWithDetails } from "../../../types";

interface StoreOverviewTabProps {
  store: StoreWithDetails;
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

export const StoreOverviewTab: React.FC<StoreOverviewTabProps> = ({ store }) => {
  const company = store.company;
  const settings = store.settings;
  const subscription = store.subscription;

  return (
    <View style={styles.container}>
      {/* 1. Business Profile Info */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Building2 size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Business Information</Text>
        </View>

        <View style={styles.fieldList}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Business Type</Text>
            <Text style={styles.fieldValue}>
              {company?.businessType || "Retail Store"}
            </Text>
          </View>

          {company?.description ? (
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Store Description</Text>
              <Text style={styles.fieldDescription}>
                {company.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.fieldRow}>
            <View style={styles.labelWithIcon}>
              <Mail size={13} color={Colors.textMuted} />
              <Text style={styles.fieldLabel}>Contact Email</Text>
            </View>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {company?.email || "Not configured"}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.labelWithIcon}>
              <Phone size={13} color={Colors.textMuted} />
              <Text style={styles.fieldLabel}>Contact Phone</Text>
            </View>
            <Text style={styles.fieldValue}>
              {company?.phone || "Not configured"}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.labelWithIcon}>
              <MessageCircle size={13} color="#25D366" />
              <Text style={styles.fieldLabel}>WhatsApp</Text>
            </View>
            <Text style={styles.fieldValue}>
              {company?.whatsapp || "Not configured"}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.labelWithIcon}>
              <MapPin size={13} color={Colors.warning} />
              <Text style={styles.fieldLabel}>Store Address</Text>
            </View>
            <Text style={styles.fieldValue} numberOfLines={2}>
              {company?.address || "No address provided"}
            </Text>
          </View>
        </View>
      </Card>

      {/* 2. Operations & Channels Summary */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Layers size={16} color={Colors.info} />
          <Text style={styles.cardTitle}>Checkout & Operations</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.statusTile}>
            <Text style={styles.statusTileLabel}>Online Orders</Text>
            <View style={styles.statusBadgeRow}>
              {settings?.ordersEnabled !== false ? (
                <>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={[styles.statusText, { color: Colors.success }]}>
                    Active
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={Colors.danger} />
                  <Text style={[styles.statusText, { color: Colors.danger }]}>
                    Paused
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusTile}>
            <Text style={styles.statusTileLabel}>Cash on Delivery</Text>
            <View style={styles.statusBadgeRow}>
              {settings?.codEnabled ? (
                <>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={[styles.statusText, { color: Colors.success }]}>
                    Enabled
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={Colors.textMuted} />
                  <Text style={[styles.statusText, { color: Colors.textMuted }]}>
                    Disabled
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusTile}>
            <Text style={styles.statusTileLabel}>Online Payment</Text>
            <View style={styles.statusBadgeRow}>
              {settings?.onlinePaymentEnabled ? (
                <>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={[styles.statusText, { color: Colors.success }]}>
                    Razorpay
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={Colors.textMuted} />
                  <Text style={[styles.statusText, { color: Colors.textMuted }]}>
                    Disabled
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusTile}>
            <Text style={styles.statusTileLabel}>WhatsApp Orders</Text>
            <View style={styles.statusBadgeRow}>
              {settings?.whatsappOrderEnabled ? (
                <>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={[styles.statusText, { color: Colors.success }]}>
                    Enabled
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={Colors.textMuted} />
                  <Text style={[styles.statusText, { color: Colors.textMuted }]}>
                    Disabled
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.shippingSummaryRow}>
          <Truck size={14} color={Colors.primary} />
          <Text style={styles.shippingSummaryLabel}>Shipping Model:</Text>
          <Text style={styles.shippingSummaryValue}>
            {settings?.shippingType === "FREE"
              ? "Free Shipping on All Orders"
              : settings?.shippingType === "ORDER_AMOUNT"
              ? `Free above ₹${settings.shippingMinOrderAmount || 0} (else ₹${settings.shippingFallbackCharge || 0})`
              : settings?.shippingType === "FIXED"
              ? `Flat ₹${settings.shippingFixedCharge || 0}`
              : "Standard Shipping"}
          </Text>
        </View>
      </Card>

      {/* 3. Subscription & Plan Summary */}
      {subscription ? (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={16} color={Colors.warning} />
            <Text style={styles.cardTitle}>Subscription Plan</Text>
          </View>

          <View style={styles.subContent}>
            <View style={styles.subTopRow}>
              <View>
                <Text style={styles.planName}>
                  {subscription.plan?.name || "Merchant Plan"}
                </Text>
                <Text style={styles.planPrice}>
                  ₹{(subscription.plan?.price || 0).toLocaleString("en-IN")} / year
                </Text>
              </View>
              <Badge
                label={subscription.status}
                variant={subscription.status === "ACTIVE" ? "success" : "warning"}
              />
            </View>

            <View style={styles.periodRow}>
              <Calendar size={12} color={Colors.textMuted} />
              <Text style={styles.periodText}>
                Renewal: {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      {/* 4. Store Metadata & Identifiers */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Globe size={16} color={Colors.textMuted} />
          <Text style={styles.cardTitle}>Store Metadata</Text>
        </View>

        <View style={styles.fieldList}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Store Slug</Text>
            <Text style={styles.fieldValue}>{store.slug}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Custom Domain</Text>
            <Text style={styles.fieldValue}>
              {store.customDomain || "None"}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Domain Status</Text>
            <Badge
              label={store.domainStatus || "NONE"}
              variant={store.domainStatus === "CONNECTED" ? "success" : "muted"}
              size="sm"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Store Created</Text>
            <Text style={styles.fieldValue}>{formatDate(store.createdAt)}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  fieldList: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldCol: {
    gap: 4,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    maxWidth: "60%",
    textAlign: "right",
  },
  fieldDescription: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusTile: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statusTileLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  shippingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shippingSummaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  shippingSummaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryText,
    flex: 1,
  },
  subContent: {
    gap: 10,
  },
  subTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  periodText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

