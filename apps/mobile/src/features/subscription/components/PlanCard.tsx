// apps/mobile/src/features/subscription/components/PlanCard.tsx
// Subscription tier card displaying pricing, limits, and feature checklist

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Sparkles, Star } from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Plan, BillingPeriod } from "../../../types";

interface PlanCardProps {
  plan: Plan;
  billingPeriod: BillingPeriod;
  isCurrentPlan: boolean;
  onSelectPlan: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingPeriod,
  isCurrentPlan,
  onSelectPlan,
}) => {
  const isYearly = billingPeriod === "YEARLY";
  const price = isYearly && plan.yearlyPrice
    ? plan.yearlyPrice
    : isYearly
    ? Math.round(Number(plan.price) * 12 * 0.8)
    : plan.price;

  const features = plan.features && plan.features.length > 0
    ? plan.features
    : [
        `Up to ${plan.maxProducts || "Unlimited"} products`,
        plan.customDomainAccess ? "Custom domain mapping" : "Subdomain on launchcommerce.com",
        plan.advancedAnalytics ? "Advanced sales & customer analytics" : "Standard dashboard overview",
        plan.premiumThemes ? "Full theme customization & colors" : "Default storefront theme",
        "Zero transaction commission",
        "24/7 Merchant support",
      ];

  return (
    <Card
      style={[
        styles.card,
        plan.isFeatured && styles.featuredCard,
        isCurrentPlan && styles.currentPlanCard,
      ]}
    >
      {/* Featured / Badge Banner */}
      {plan.badge || plan.isFeatured ? (
        <View style={styles.badgeContainer}>
          <View style={styles.featuredPill}>
            <Star size={11} color={Colors.white} fill={Colors.white} />
            <Text style={styles.featuredPillText}>
              {plan.badge || "MOST POPULAR"}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Plan Title & Description */}
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{plan.name}</Text>
          {isCurrentPlan && (
            <Badge label="CURRENT PLAN" variant="success" size="sm" />
          )}
        </View>
        {plan.description ? (
          <Text style={styles.description}>{plan.description}</Text>
        ) : null}
      </View>

      {/* Price Display */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.priceValue}>
            {Number(price).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.periodText}>
            / {isYearly ? "year" : "month"}
          </Text>
        </View>

        {isYearly && plan.yearlyPrice ? (
          <Text style={styles.savingsTag}>Save ~20% with annual billing</Text>
        ) : null}
      </View>

      {/* Features Checklist */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresHeading}>Included Features:</Text>
        {features.map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <View style={styles.checkCircle}>
              <Check size={11} color={Colors.success} />
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <Button
        title={isCurrentPlan ? "Active Plan" : "Choose Plan"}
        variant={isCurrentPlan ? "outline" : plan.isFeatured ? "primary" : "secondary"}
        onPress={() => onSelectPlan(plan)}
        disabled={isCurrentPlan}
        style={styles.ctaButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 16,
    borderRadius: 18,
    marginBottom: 16,
  },
  featuredCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "rgba(15, 23, 56, 0.95)",
  },
  currentPlanCard: {
    borderColor: "rgba(34, 197, 94, 0.4)",
    borderWidth: 1.5,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    marginBottom: -4,
  },
  featuredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  header: {
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  priceContainer: {
    gap: 4,
    paddingVertical: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  periodText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  savingsTag: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.success,
  },
  featuresContainer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featuresHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  ctaButton: {
    marginTop: 8,
  },
});

