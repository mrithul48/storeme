// apps/mobile/src/features/subscription/components/BillingHistoryCard.tsx
// Subscription payment history and transaction ledger

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { SubscriptionPayment } from "../../../types";

interface BillingHistoryCardProps {
  payments: SubscriptionPayment[];
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

export const BillingHistoryCard: React.FC<BillingHistoryCardProps> = ({
  payments,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Receipt size={16} color={Colors.primary} />
          <Text style={styles.title}>Billing & Payment History</Text>
        </View>
        <Badge
          label={`${payments.length} ${payments.length === 1 ? "payment" : "payments"}`}
          variant="muted"
          size="sm"
        />
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Invoices Yet</Text>
          <Text style={styles.emptySub}>
            Transactions will appear here after upgrading or renewing your subscription.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {payments.map((payment) => {
            const isPaid = payment.status === "PAID";
            return (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentLeft}>
                  <View
                    style={[
                      styles.iconWrapper,
                      isPaid ? styles.iconPaid : styles.iconPending,
                    ]}
                  >
                    {isPaid ? (
                      <CheckCircle2 size={15} color={Colors.success} />
                    ) : (
                      <Clock size={15} color={Colors.warning} />
                    )}
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.paymentAmount}>
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(payment.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentRight}>
                  <Badge
                    label={payment.status}
                    variant={isPaid ? "success" : "warning"}
                    size="sm"
                  />
                  {payment.razorpayPaymentId ? (
                    <Text style={styles.refId} numberOfLines={1}>
                      {payment.razorpayPaymentId}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyContainer: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
  list: {
    gap: 10,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPaid: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  iconPending: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  paymentRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  refId: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "monospace",
  },
});

