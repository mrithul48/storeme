// apps/mobile/src/features/stores/components/StoreOperationsTab.tsx
// Store checkout channels, orders toggle, and shipping rate configuration

import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Layers,
  Truck,
  CreditCard,
  MessageCircle,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { StoreWithDetails } from "../../../types";
import { useUpdateStore } from "../../../hooks/use-stores";

interface StoreOperationsTabProps {
  store: StoreWithDetails;
}

type ShippingType = "FREE" | "FIXED" | "ORDER_AMOUNT";

export const StoreOperationsTab: React.FC<StoreOperationsTabProps> = ({ store }) => {
  const settings = store.settings;

  // Toggle States
  const [ordersEnabled, setOrdersEnabled] = useState(
    settings?.ordersEnabled !== false
  );
  const [codEnabled, setCodEnabled] = useState(Boolean(settings?.codEnabled));
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(
    Boolean(settings?.onlinePaymentEnabled)
  );
  const [whatsappOrderEnabled, setWhatsappOrderEnabled] = useState(
    Boolean(settings?.whatsappOrderEnabled)
  );
  const [brandsEnabled, setBrandsEnabled] = useState(
    Boolean(settings?.brandsEnabled)
  );

  // Shipping States
  const [shippingType, setShippingType] = useState<ShippingType>(
    (settings?.shippingType as ShippingType) || "FREE"
  );
  const [fixedCharge, setFixedCharge] = useState(
    String(settings?.shippingFixedCharge || 50)
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    String(settings?.shippingMinOrderAmount || 500)
  );
  const [fallbackCharge, setFallbackCharge] = useState(
    String(settings?.shippingFallbackCharge || 50)
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const updateStoreMutation = useUpdateStore();

  const handleSave = async () => {
    setFeedback(null);

    const fixedChargeNum = Number(fixedCharge) || 0;
    const minOrderNum = Number(minOrderAmount) || 0;
    const fallbackNum = Number(fallbackCharge) || 0;

    try {
      await updateStoreMutation.mutateAsync({
        settings: {
          ordersEnabled,
          codEnabled,
          onlinePaymentEnabled,
          whatsappOrderEnabled,
          brandsEnabled,
          shippingType,
          shippingFixedCharge: fixedChargeNum,
          shippingMinOrderAmount: minOrderNum,
          shippingFallbackCharge: fallbackNum,
        },
      });

      setFeedback({
        type: "success",
        message: "Store operations and shipping settings updated!",
      });

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update store settings.",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Feedback Banner */}
      {feedback ? (
        <View
          style={[
            styles.feedbackBanner,
            feedback.type === "success"
              ? styles.feedbackSuccess
              : styles.feedbackError,
          ]}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} color={Colors.success} />
          ) : (
            <AlertCircle size={16} color={Colors.danger} />
          )}
          <Text
            style={[
              styles.feedbackText,
              feedback.type === "success"
                ? { color: Colors.success }
                : { color: Colors.danger },
            ]}
          >
            {feedback.message}
          </Text>
        </View>
      ) : null}

      {/* Checkout Channels & Payment Toggles */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Layers size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Ordering & Payment Channels</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Accept Online Orders</Text>
            <Text style={styles.toggleSub}>
              Enable or temporarily pause checkout on your storefront
            </Text>
          </View>
          <Switch
            value={ordersEnabled}
            onValueChange={setOrdersEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.labelWithIcon}>
              <Banknote size={14} color={Colors.success} />
              <Text style={styles.toggleLabel}>Cash on Delivery (COD)</Text>
            </View>
            <Text style={styles.toggleSub}>
              Allow shoppers to pay with cash upon receiving their order
            </Text>
          </View>
          <Switch
            value={codEnabled}
            onValueChange={setCodEnabled}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.labelWithIcon}>
              <CreditCard size={14} color={Colors.info} />
              <Text style={styles.toggleLabel}>Online Payment (Razorpay)</Text>
            </View>
            <Text style={styles.toggleSub}>
              Accept UPI, Cards, NetBanking, and Wallets
            </Text>
          </View>
          <Switch
            value={onlinePaymentEnabled}
            onValueChange={setOnlinePaymentEnabled}
            trackColor={{ false: Colors.border, true: Colors.info }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.labelWithIcon}>
              <MessageCircle size={14} color="#25D366" />
              <Text style={styles.toggleLabel}>WhatsApp Ordering</Text>
            </View>
            <Text style={styles.toggleSub}>
              Show "Order via WhatsApp" button on product detail pages
            </Text>
          </View>
          <Switch
            value={whatsappOrderEnabled}
            onValueChange={setWhatsappOrderEnabled}
            trackColor={{ false: Colors.border, true: "#25D366" }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.labelWithIcon}>
              <Tag size={14} color={Colors.warning} />
              <Text style={styles.toggleLabel}>Brands Directory</Text>
            </View>
            <Text style={styles.toggleSub}>
              Show dedicated Brands filter and carousel on storefront
            </Text>
          </View>
          <Switch
            value={brandsEnabled}
            onValueChange={setBrandsEnabled}
            trackColor={{ false: Colors.border, true: Colors.warning }}
            thumbColor={Colors.white}
          />
        </View>
      </Card>

      {/* Shipping Model Configuration */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Truck size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Shipping Configuration</Text>
        </View>

        {/* Model Selector Tabs */}
        <View style={styles.shippingTypeSelector}>
          <TouchableOpacity
            style={[
              styles.shippingTypeOption,
              shippingType === "FREE" && styles.shippingTypeOptionActive,
            ]}
            onPress={() => setShippingType("FREE")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.shippingTypeOptionText,
                shippingType === "FREE" && styles.shippingTypeOptionTextActive,
              ]}
            >
              Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingTypeOption,
              shippingType === "FIXED" && styles.shippingTypeOptionActive,
            ]}
            onPress={() => setShippingType("FIXED")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.shippingTypeOptionText,
                shippingType === "FIXED" && styles.shippingTypeOptionTextActive,
              ]}
            >
              Flat Rate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingTypeOption,
              shippingType === "ORDER_AMOUNT" && styles.shippingTypeOptionActive,
            ]}
            onPress={() => setShippingType("ORDER_AMOUNT")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.shippingTypeOptionText,
                shippingType === "ORDER_AMOUNT" && styles.shippingTypeOptionTextActive,
              ]}
            >
              Threshold
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Inputs based on selected model */}
        {shippingType === "FREE" ? (
          <View style={styles.shippingNotice}>
            <Text style={styles.shippingNoticeText}>
              All orders qualify for 100% Free Shipping at checkout. No delivery charge will be added.
            </Text>
          </View>
        ) : shippingType === "FIXED" ? (
          <Input
            label="Flat Delivery Charge (₹)"
            value={fixedCharge}
            onChangeText={setFixedCharge}
            keyboardType="numeric"
            placeholder="50"
          />
        ) : (
          <View style={{ gap: 12 }}>
            <Input
              label="Free Shipping Above Order (₹)"
              value={minOrderAmount}
              onChangeText={setMinOrderAmount}
              keyboardType="numeric"
              placeholder="499"
            />
            <Input
              label="Standard Shipping Fee Below Threshold (₹)"
              value={fallbackCharge}
              onChangeText={setFallbackCharge}
              keyboardType="numeric"
              placeholder="40"
            />
          </View>
        )}
      </Card>

      {/* Save Button */}
      <Button
        title={updateStoreMutation.isPending ? "Saving Settings..." : "Save Store Operations"}
        onPress={handleSave}
        loading={updateStoreMutation.isPending}
        style={styles.saveButton}
      />
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 3,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  shippingTypeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  shippingTypeOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shippingTypeOptionActive: {
    backgroundColor: Colors.primary,
  },
  shippingTypeOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  shippingTypeOptionTextActive: {
    color: Colors.white,
  },
  shippingNotice: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shippingNoticeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  feedbackError: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});

