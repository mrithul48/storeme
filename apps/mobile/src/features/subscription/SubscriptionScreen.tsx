// apps/mobile/src/features/subscription/SubscriptionScreen.tsx
// Comprehensive subscription management, plan exploration, and billing dashboard

import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Sparkles,
  Receipt,
  Layers,
  AlertCircle,
  CheckCircle2,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { EmptyState } from "../../components/common/EmptyState";
import { SubscriptionSkeleton } from "../../components/common/LoadingSkeleton";
import { CurrentPlanCard } from "./components/CurrentPlanCard";
import { PlanLimitsCard } from "./components/PlanLimitsCard";
import { PlanCard } from "./components/PlanCard";
import { BillingHistoryCard } from "./components/BillingHistoryCard";
import { CheckoutModal } from "./components/CheckoutModal";
import {
  useCurrentSubscription,
  usePlans,
} from "../../hooks/use-subscriptions";
import { Plan, BillingPeriod } from "../../types";

type TabKey = "OVERVIEW" | "PLANS" | "HISTORY";

export const SubscriptionScreen: React.FC = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("YEARLY");

  // Selected plan for checkout modal
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fetch current subscription and limits
  const {
    subscription,
    limits,
    payments,
    isLoading: isSubLoading,
    isFetching: isSubFetching,
    error: subError,
    refetch: refetchSub,
  } = useCurrentSubscription();

  // Fetch available public plans
  const {
    plans,
    isLoading: isPlansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = usePlans();

  const isLoading = isSubLoading || isPlansLoading;
  const isFetching = isSubFetching;

  const handleRefresh = async () => {
    await Promise.all([refetchSub(), refetchPlans()]);
  };

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutModalVisible(true);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutModalVisible(false);
    setSelectedPlanForCheckout(null);
    setSuccessBanner("Your subscription has been activated successfully!");
    handleRefresh();

    setTimeout(() => {
      setSuccessBanner(null);
    }, 5000);
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    {
      key: "OVERVIEW",
      label: "My Plan",
      icon: (
        <CreditCard
          size={14}
          color={activeTab === "OVERVIEW" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "PLANS",
      label: "All Plans",
      icon: (
        <Sparkles
          size={14}
          color={activeTab === "PLANS" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "HISTORY",
      label: "Billing",
      icon: (
        <Receipt
          size={14}
          color={activeTab === "HISTORY" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
  ];

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
        <Text style={styles.headerTitle}>Subscription & Billing</Text>
      </View>

      {/* Success Notification Banner */}
      {successBanner ? (
        <View style={styles.successBanner}>
          <CheckCircle2 size={16} color={Colors.success} />
          <Text style={styles.successBannerText}>{successBanner}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <SubscriptionSkeleton />
      ) : subError && plansError ? (
        <View style={styles.centerContainer}>
          <EmptyState
            title="Failed to Load Subscription"
            description={subError || "Could not connect to billing server."}
            icon={<AlertCircle size={48} color={Colors.danger} />}
            actionTitle="Try Again"
            onAction={handleRefresh}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Navigation Tab Bar */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.7}
                >
                  {tab.icon}
                  <Text
                    style={[
                      styles.tabButtonText,
                      isActive && styles.tabButtonTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "OVERVIEW" && (
            <View style={styles.sectionContainer}>
              <CurrentPlanCard
                subscription={subscription}
                onExplorePlans={() => setActiveTab("PLANS")}
              />
              <PlanLimitsCard limits={limits} />
              <BillingHistoryCard payments={payments.slice(0, 3)} />
            </View>
          )}

          {/* TAB 2: AVAILABLE PLANS */}
          {activeTab === "PLANS" && (
            <View style={styles.sectionContainer}>
              {/* Billing Cycle Switcher */}
              <View style={styles.cycleSwitcherContainer}>
                <TouchableOpacity
                  style={[
                    styles.cycleOption,
                    billingPeriod === "MONTHLY" && styles.cycleOptionActive,
                  ]}
                  onPress={() => setBillingPeriod("MONTHLY")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cycleOptionText,
                      billingPeriod === "MONTHLY" && styles.cycleOptionTextActive,
                    ]}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cycleOption,
                    billingPeriod === "YEARLY" && styles.cycleOptionActive,
                  ]}
                  onPress={() => setBillingPeriod("YEARLY")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cycleOptionText,
                      billingPeriod === "YEARLY" && styles.cycleOptionTextActive,
                    ]}
                  >
                    Yearly (Save ~20%)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Plans List */}
              {plans.length === 0 ? (
                <EmptyState
                  title="No Plans Available"
                  description="Subscription plans are currently being configured by the platform administrator."
                  icon={<Sparkles size={40} color={Colors.primaryText} />}
                />
              ) : (
                plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billingPeriod={billingPeriod}
                    isCurrentPlan={subscription?.planId === plan.id}
                    onSelectPlan={handleOpenCheckout}
                  />
                ))
              )}
            </View>
          )}

          {/* TAB 3: BILLING HISTORY */}
          {activeTab === "HISTORY" && (
            <View style={styles.sectionContainer}>
              <BillingHistoryCard payments={payments} />
            </View>
          )}
        </ScrollView>
      )}

      {/* Razorpay Checkout Modal */}
      <CheckoutModal
        visible={checkoutModalVisible}
        plan={selectedPlanForCheckout}
        billingPeriod={billingPeriod}
        onClose={() => setCheckoutModalVisible(false)}
        onSuccess={handleCheckoutSuccess}
      />
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: "rgba(65, 105, 225, 0.15)",
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primaryText,
  },
  sectionContainer: {
    gap: 16,
  },
  cycleSwitcherContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    marginBottom: 4,
  },
  cycleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleOptionActive: {
    backgroundColor: Colors.primary,
  },
  cycleOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  cycleOptionTextActive: {
    color: Colors.white,
  },
});

