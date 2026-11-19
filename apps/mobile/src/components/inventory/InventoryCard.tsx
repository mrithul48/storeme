// apps/mobile/src/components/inventory/InventoryCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react-native";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Colors } from "../../constants/theme";
import { InventoryItem } from "../../types";

interface InventoryCardProps {
  item: InventoryItem;
  threshold?: number;
  onAdjustStock: (item: InventoryItem, variantId?: string) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  threshold = 5,
  onAdjustStock,
}) => {
  const [expanded, setExpanded] = useState(false);

  const hasVariants = item.variants && item.variants.length > 0;
  const isOutOfStock = item.stock <= 0 || !item.inStock;
  const isLowStock = !isOutOfStock && item.stock <= threshold && item.manageStockQuantity;

  return (
    <Card style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <View style={styles.metaRow}>
            {item.sku ? (
              <Text style={styles.skuText}>SKU: {item.sku}</Text>
            ) : null}
            {hasVariants && (
              <View style={styles.variantChip}>
                <Layers size={11} color={Colors.primaryText} />
                <Text style={styles.variantChipText}>
                  {item.variants.length} {item.variants.length === 1 ? "color" : "colors"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.badgeContainer}>
          {isOutOfStock ? (
            <Badge label="Out of Stock" variant="danger" dot size="sm" />
          ) : isLowStock ? (
            <Badge label="Low Stock" variant="warning" dot size="sm" />
          ) : (
            <Badge label="In Stock" variant="success" dot size="sm" />
          )}
        </View>
      </View>

      {/* Stock Units Metric Row */}
      <View style={styles.metricsRow}>
        <View style={styles.stockBlock}>
          <Text style={styles.stockLabel}>Available Stock</Text>
          <View style={styles.stockValueContainer}>
            <Text
              style={[
                styles.stockValue,
                isOutOfStock && styles.stockOutOfStock,
                isLowStock && styles.stockLowStock,
              ]}
            >
              {item.stock}
            </Text>
            <Text style={styles.stockUnit}>units</Text>
          </View>
        </View>

        <Button
          title="Adjust"
          variant="outline"
          size="sm"
          icon={<SlidersHorizontal size={13} color={Colors.primaryText} />}
          onPress={() => onAdjustStock(item)}
          style={styles.adjustButton}
        />
      </View>

      {/* Low Stock Warning Banner */}
      {isLowStock && (
        <View style={styles.lowStockBanner}>
          <AlertTriangle size={13} color={Colors.warning} />
          <Text style={styles.lowStockText}>
            Stock is below reorder threshold ({threshold} units)
          </Text>
        </View>
      )}

      {/* Color Variants Section */}
      {hasVariants && (
        <View style={styles.variantsSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            style={styles.expandHeader}
          >
            <Text style={styles.expandTitle}>
              Color Breakdown ({item.variants.length})
            </Text>
            {expanded ? (
              <ChevronUp size={16} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={16} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>

          {expanded && (
            <View style={styles.variantsList}>
              {item.variants.map((v) => {
                const vOut = v.stock <= 0 || !v.inStock;
                const vLow = !vOut && v.stock <= threshold && v.manageQuantity;

                return (
                  <View key={v.id} style={styles.variantRow}>
                    <View style={styles.variantColorContainer}>
                      <View style={styles.colorIndicator} />
                      <Text style={styles.variantColorName}>{v.color}</Text>
                    </View>

                    <View style={styles.variantActionsContainer}>
                      <Text
                        style={[
                          styles.variantStockCount,
                          vOut && { color: Colors.danger },
                          vLow && { color: Colors.warning },
                        ]}
                      >
                        {v.stock} units
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onAdjustStock(item, v.id)}
                        style={styles.variantAdjustBtn}
                      >
                        <Text style={styles.variantAdjustText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  skuText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
  },
  variantChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  badgeContainer: {
    alignItems: "flex-end",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockBlock: {
    gap: 2,
  },
  stockLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: Colors.textSecondary,
  },
  stockValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  stockOutOfStock: {
    color: Colors.danger,
  },
  stockLowStock: {
    color: Colors.warning,
  },
  stockUnit: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  adjustButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  lowStockBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warningBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  lowStockText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: "500",
    flex: 1,
  },
  variantsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  expandTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  variantsList: {
    marginTop: 8,
    gap: 6,
  },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantColorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryText,
  },
  variantColorName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  variantActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  variantStockCount: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  variantAdjustText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryText,
  },
  variantAdjustBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
  },
});

