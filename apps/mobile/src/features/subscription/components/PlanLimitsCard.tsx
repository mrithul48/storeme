// apps/mobile/src/features/subscription/components/PlanLimitsCard.tsx
// Visual quota consumption and feature permissions breakdown

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Package,
  Globe,
  BarChart3,
  Palette,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { PlanLimitStatus } from "../../../types";

interface PlanLimitsCardProps {
  limits: PlanLimitStatus | null;
}

export const PlanLimitsCard: React.FC<PlanLimitsCardProps> = ({ limits }) => {
  if (!limits) return null;

  const current = limits.currentProducts || 0;
  const max = limits.maxProducts || 100;
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Package size={16} color={Colors.primary} />
          <Text style={styles.title}>Usage & Feature Limits</Text>
        </View>
        <Text style={styles.planBadge}>{limits.planName}</Text>
      </View>

      {/* Product Quota Progress */}
      <View style={styles.quotaSection}>
        <View style={styles.quotaHeader}>
          <Text style={styles.quotaLabel}>Product Catalogue Limit</Text>
          <Text style={styles.quotaNumbers}>
            <Text style={{ fontWeight: "700", color: Colors.textPrimary }}>
              {current}
            </Text>{" "}
            / {max} products ({percentage}%)
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: isAtLimit
                  ? Colors.danger
                  : isNearLimit
                  ? Colors.warning
                  : Colors.primary,
              },
            ]}
          />
        </View>

        {isAtLimit ? (
          <View style={styles.warningRow}>
            <AlertTriangle size={13} color={Colors.danger} />
            <Text style={[styles.warningText, { color: Colors.danger }]}>
              Product limit reached. Upgrade plan to add more products.
            </Text>
          </View>
        ) : isNearLimit ? (
          <View style={styles.warningRow}>
            <AlertTriangle size={13} color={Colors.warning} />
            <Text style={styles.warningText}>
              Approaching product limit ({max - current} remaining).
            </Text>
          </View>
        ) : null}
      </View>

      {/* Feature Capabilities Grid */}
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <View style={styles.featureLeft}>
            <Globe size={14} color={Colors.textSecondary} />
            <Text style={styles.featureName}>Custom Domain Access</Text>
          </View>
          {limits.customDomainAccess ? (
            <CheckCircle2 size={16} color={Colors.success} />
          ) : (
            <XCircle size={16} color={Colors.textMuted} />
          )}
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureLeft}>
            <BarChart3 size={14} color={Colors.textSecondary} />
            <Text style={styles.featureName}>Advanced Analytics</Text>
          </View>
          {limits.advancedAnalytics ? (
            <CheckCircle2 size={16} color={Colors.success} />
          ) : (
            <XCircle size={16} color={Colors.textMuted} />
          )}
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureLeft}>
            <Palette size={14} color={Colors.textSecondary} />
            <Text style={styles.featureName}>Premium Store Themes</Text>
          </View>
          {limits.premiumThemes ? (
            <CheckCircle2 size={16} color={Colors.success} />
          ) : (
            <XCircle size={16} color={Colors.textMuted} />
          )}
        </View>
      </View>
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
  planBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  quotaSection: {
    gap: 8,
  },
  quotaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quotaLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  quotaNumbers: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    flex: 1,
  },
  featuresList: {
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureName: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
});

