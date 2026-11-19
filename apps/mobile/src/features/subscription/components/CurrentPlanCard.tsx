// apps/mobile/src/features/subscription/components/CurrentPlanCard.tsx
// Active merchant subscription overview card with renewal dates and cancellation options

import React from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { SubscriptionDetail, SubscriptionStatus } from "../../../types";
import { useCancelSubscription } from "../../../hooks/use-subscriptions";

interface CurrentPlanCardProps {
  subscription: SubscriptionDetail | null;
  onExplorePlans: () => void;
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

function getStatusBadge(status?: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return <Badge label="ACTIVE" variant="success" size="sm" />;
    case "TRIAL":
      return <Badge label="TRIAL" variant="info" size="sm" />;
    case "CANCELLED":
      return <Badge label="CANCELLED" variant="warning" size="sm" />;
    case "PAST_DUE":
      return <Badge label="PAYMENT DUE" variant="danger" size="sm" />;
    case "EXPIRED":
      return <Badge label="EXPIRED" variant="danger" size="sm" />;
    default:
      return <Badge label="NO PLAN" variant="muted" size="sm" />;
  }
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  subscription,
  onExplorePlans,
}) => {
  const cancelMutation = useCancelSubscription();

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You will maintain full access until the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Confirm Cancellation",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync("User requested from mobile app");
              Alert.alert(
                "Subscription Cancelled",
                "Your subscription will not renew after the current billing cycle."
              );
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.message || "Failed to cancel subscription."
              );
            }
          },
        },
      ]
    );
  };

  if (!subscription) {
    return (
      <Card style={styles.card}>
        <View style={styles.noSubHeader}>
          <AlertTriangle size={20} color={Colors.warning} />
          <Text style={styles.noSubTitle}>No Active Subscription</Text>
        </View>
        <Text style={styles.noSubText}>
          Your store is currently running with standard limits. Upgrade to a plan to unlock custom domains, higher product limits, and premium features.
        </Text>
        <Button
          title="Explore Plans"
          onPress={onExplorePlans}
          style={styles.exploreButton}
        />
      </Card>
    );
  }

  const plan = subscription.plan;
  const isYearly = subscription.billingPeriod === "YEARLY";
  const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;

  return (
    <Card style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.planTitleCol}>
          <View style={styles.planBadgeRow}>
            <Sparkles size={16} color={Colors.warning} />
            <Text style={styles.planName}>{plan.name}</Text>
          </View>
          <Text style={styles.cycleText}>
            Billed {isYearly ? "Annually" : "Monthly"}
          </Text>
        </View>

        {getStatusBadge(subscription.status)}
      </View>

      {/* Price Display */}
      <View style={styles.priceRow}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.priceValue}>
          {Number(price).toLocaleString("en-IN")}
        </Text>
        <Text style={styles.periodSuffix}>
          / {isYearly ? "year" : "month"}
        </Text>
      </View>

      {/* Date Information */}
      <View style={styles.datesContainer}>
        <View style={styles.dateItem}>
          <Calendar size={13} color={Colors.textMuted} />
          <Text style={styles.dateLabel}>Started:</Text>
          <Text style={styles.dateValue}>
            {formatDate(subscription.currentPeriodStart)}
          </Text>
        </View>

        <View style={styles.dateItem}>
          <Clock size={13} color={Colors.primaryText} />
          <Text style={styles.dateLabel}>
            {subscription.cancelAtPeriodEnd ? "Access Ends:" : "Next Renewal:"}
          </Text>
          <Text
            style={[
              styles.dateValue,
              { color: subscription.cancelAtPeriodEnd ? Colors.warning : Colors.primaryText },
            ]}
          >
            {formatDate(subscription.currentPeriodEnd)}
          </Text>
        </View>
      </View>

      {/* Cancellation Notice Banner */}
      {subscription.cancelAtPeriodEnd ? (
        <View style={styles.cancelNoticeBanner}>
          <AlertTriangle size={14} color={Colors.warning} />
          <Text style={styles.cancelNoticeText}>
            Subscription is scheduled to cancel on {formatDate(subscription.currentPeriodEnd)}.
          </Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          title="Change Plan"
          variant="primary"
          size="sm"
          onPress={onExplorePlans}
          style={{ flex: 1 }}
        />

        {subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd ? (
          <Button
            title={cancelMutation.isPending ? "Cancelling..." : "Cancel Plan"}
            variant="outline"
            size="sm"
            onPress={handleCancel}
            loading={cancelMutation.isPending}
            style={{ flex: 1 }}
          />
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planTitleCol: {
    gap: 4,
  },
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  cycleText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  periodSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  datesContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cancelNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  cancelNoticeText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "500",
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  noSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noSubTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  noSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  exploreButton: {
    marginTop: 6,
  },
});

