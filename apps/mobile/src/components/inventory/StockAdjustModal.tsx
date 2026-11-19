// apps/mobile/src/components/inventory/StockAdjustModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  X,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  ArrowRight,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { InventoryItem, StockOperation } from "../../types";
import { useAdjustStock } from "../../hooks/use-inventory";

interface StockAdjustModalProps {
  visible: boolean;
  item: InventoryItem | null;
  selectedVariantId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  visible,
  item,
  selectedVariantId,
  onClose,
  onSuccess,
}) => {
  const [targetVariantId, setTargetVariantId] = useState<string | undefined>(selectedVariantId);
  const [operation, setOperation] = useState<StockOperation>("SET");
  const [quantityText, setQuantityText] = useState("1");
  const [reason, setReason] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const adjustStockMutation = useAdjustStock();

  useEffect(() => {
    if (visible) {
      setTargetVariantId(selectedVariantId);
      setOperation("SET");
      setReason("");
      setErrorText(null);

      // Default quantity to current stock if SET, or 1 if INCREMENT/DECREMENT
      const currentStock = getCurrentStock();
      setQuantityText(currentStock.toString());
    }
  }, [visible, selectedVariantId, item]);

  if (!item) return null;

  const currentVariant = item.variants?.find((v) => v.id === targetVariantId);
  const currentStock = currentVariant ? currentVariant.stock : item.stock;
  const targetName = currentVariant
    ? `${item.productName} (${currentVariant.color})`
    : item.productName;

  function getCurrentStock(): number {
    if (!item) return 0;
    const v = item.variants?.find((varItem) => varItem.id === targetVariantId);
    return v ? v.stock : item.stock;
  }

  const parsedQty = Math.max(0, parseInt(quantityText, 10) || 0);

  // Compute preview new stock
  let projectedNewStock = currentStock;
  let isInsufficientStock = false;

  if (operation === "SET") {
    projectedNewStock = parsedQty;
  } else if (operation === "INCREMENT") {
    projectedNewStock = currentStock + parsedQty;
  } else if (operation === "DECREMENT") {
    projectedNewStock = currentStock - parsedQty;
    if (projectedNewStock < 0) {
      isInsufficientStock = true;
    }
  }

  const handleStep = (delta: number) => {
    const nextVal = Math.max(0, parsedQty + delta);
    setQuantityText(nextVal.toString());
  };

  const handleConfirm = async () => {
    if (isInsufficientStock) {
      setErrorText("Cannot decrement more stock than currently available.");
      return;
    }

    if (parsedQty < 0) {
      setErrorText("Quantity must be a positive number.");
      return;
    }

    setErrorText(null);

    try {
      await adjustStockMutation.mutateAsync({
        productId: item.productId,
        variantId: targetVariantId || undefined,
        operation,
        quantity: parsedQty,
        reason: reason.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to adjust stock. Please verify and try again.";
      setErrorText(msg);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.title}>Adjust Stock</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {targetName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Variant Selector (if product has variants) */}
            {item.variants && item.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Select Target</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setTargetVariantId(undefined);
                      setQuantityText(item.stock.toString());
                    }}
                    style={[
                      styles.variantChip,
                      !targetVariantId && styles.variantChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantChipText,
                        !targetVariantId && styles.variantChipTextActive,
                      ]}
                    >
                      Entire Product ({item.stock})
                    </Text>
                  </TouchableOpacity>

                  {item.variants.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => {
                        setTargetVariantId(v.id);
                        setQuantityText(v.stock.toString());
                      }}
                      style={[
                        styles.variantChip,
                        targetVariantId === v.id && styles.variantChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantChipText,
                          targetVariantId === v.id && styles.variantChipTextActive,
                        ]}
                      >
                        {v.color} ({v.stock})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Operation Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Operation</Text>
              <View style={styles.operationRow}>
                {(["SET", "INCREMENT", "DECREMENT"] as StockOperation[]).map((op) => {
                  const isActive = operation === op;
                  const label =
                    op === "SET"
                      ? "Set To"
                      : op === "INCREMENT"
                      ? "Add (+)"
                      : "Remove (-)";

                  return (
                    <TouchableOpacity
                      key={op}
                      activeOpacity={0.7}
                      onPress={() => {
                        setOperation(op);
                        if (op === "SET") {
                          setQuantityText(currentStock.toString());
                        } else {
                          setQuantityText("1");
                        }
                      }}
                      style={[
                        styles.operationBtn,
                        isActive && styles.operationBtnActive,
                        isActive && op === "DECREMENT" && styles.operationBtnDanger,
                      ]}
                    >
                      <Text
                        style={[
                          styles.operationText,
                          isActive && styles.operationTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quantity Stepper & Direct Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() => handleStep(-1)}
                  style={styles.stepBtn}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.stepperInputWrapper}>
                  <Input
                    value={quantityText}
                    onChangeText={setQuantityText}
                    keyboardType="number-pad"
                    containerStyle={{ marginBottom: 0 }}
                    inputStyle={styles.stepperInput}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => handleStep(1)}
                  style={styles.stepBtn}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View style={styles.presetRow}>
                {[5, 10, 25, 50].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => {
                      if (operation === "SET") {
                        setQuantityText(num.toString());
                      } else {
                        handleStep(num);
                      }
                    }}
                    style={styles.presetBtn}
                  >
                    <Text style={styles.presetText}>
                      {operation === "SET" ? num : `+${num}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Live Projected Stock Preview Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewCol}>
                <Text style={styles.previewLabel}>Current</Text>
                <Text style={styles.previewValue}>{currentStock}</Text>
              </View>

              <ArrowRight size={18} color={Colors.primaryText} />

              <View style={styles.previewCol}>
                <Text style={styles.previewLabel}>New Projected</Text>
                <Text
                  style={[
                    styles.previewValue,
                    isInsufficientStock && { color: Colors.danger },
                    !isInsufficientStock && { color: Colors.success },
                  ]}
                >
                  {isInsufficientStock ? "Invalid" : projectedNewStock}
                </Text>
              </View>
            </View>

            {/* Insufficient Stock Warning */}
            {isInsufficientStock && (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color={Colors.danger} />
                <Text style={styles.errorBannerText}>
                  Decrement amount ({parsedQty}) exceeds available units ({currentStock}).
                </Text>
              </View>
            )}

            {/* Reason Input (Optional audit trail) */}
            <View style={styles.section}>
              <Input
                label="Adjustment Reason (Optional)"
                placeholder="e.g. Restocked new shipment, physical recount"
                value={reason}
                onChangeText={setReason}
                maxLength={100}
              />
            </View>

            {/* General Mutation Error */}
            {errorText && (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color={Colors.danger} />
                <Text style={styles.errorBannerText}>{errorText}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Confirm Update"
              variant={operation === "DECREMENT" ? "danger" : "primary"}
              disabled={isInsufficientStock || adjustStockMutation.isPending}
              loading={adjustStockMutation.isPending}
              onPress={handleConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
  },
  variantChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  variantChipActive: {
    borderColor: Colors.borderActive,
    backgroundColor: Colors.primaryLight,
  },
  variantChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  variantChipTextActive: {
    color: Colors.primaryText,
  },
  operationRow: {
    flexDirection: "row",
    gap: 8,
  },
  operationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  operationBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  operationBtnDanger: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  operationText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  operationTextActive: {
    color: Colors.white,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperInputWrapper: {
    flex: 1,
  },
  stepperInput: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  previewCol: {
    alignItems: "center",
    gap: 2,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.textSecondary,
  },
  previewValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

