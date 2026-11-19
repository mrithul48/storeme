// apps/mobile/src/features/stores/components/StoreThemeTab.tsx
// Storefront theme colors, button shapes, and typography branding

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Palette,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  Type,
  Square,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { StoreTheme } from "../../../types";
import { useStoreTheme } from "../../../hooks/use-stores";

interface StoreThemeTabProps {
  initialTheme?: StoreTheme | null;
}

const COLOR_PRESETS = [
  { label: "Royal Blue", hex: "#4169E1" },
  { label: "Emerald Green", hex: "#22C55E" },
  { label: "Violet Purple", hex: "#8B5CF6" },
  { label: "Indigo", hex: "#6366F1" },
  { label: "Ruby Rose", hex: "#F43F5E" },
  { label: "Amber Sun", hex: "#F59E0B" },
  { label: "Ocean Teal", hex: "#14B8A6" },
  { label: "Deep Crimson", hex: "#DC2626" },
];

const BUTTON_SHAPES: Array<{
  label: string;
  value: "ROUNDED" | "PILL" | "SQUARE" | "MEDIUM_ROUNDED";
  radius: number;
}> = [
  { label: "Rounded", value: "ROUNDED", radius: 8 },
  { label: "Medium", value: "MEDIUM_ROUNDED", radius: 12 },
  { label: "Pill", value: "PILL", radius: 24 },
  { label: "Square", value: "SQUARE", radius: 2 },
];

const FONTS = ["Inter", "Plus Jakarta Sans", "Roboto", "Poppins"];

export const StoreThemeTab: React.FC<StoreThemeTabProps> = ({ initialTheme }) => {
  const { theme, updateTheme, isUpdating, refetch } = useStoreTheme();

  const currentTheme = theme || initialTheme;

  const [primaryColor, setPrimaryColor] = useState(
    currentTheme?.primaryColor || "#4169E1"
  );
  const [accentColor, setAccentColor] = useState(
    currentTheme?.accentColor || "#638BFF"
  );
  const [buttonShape, setButtonShape] = useState<
    "ROUNDED" | "PILL" | "SQUARE" | "MEDIUM_ROUNDED"
  >(currentTheme?.buttonShape || "MEDIUM_ROUNDED");
  const [primaryFont, setPrimaryFont] = useState(
    currentTheme?.primaryFont || "Inter"
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync state if fetched theme arrives
  useEffect(() => {
    if (theme) {
      if (theme.primaryColor) setPrimaryColor(theme.primaryColor);
      if (theme.accentColor) setAccentColor(theme.accentColor);
      if (theme.buttonShape) setButtonShape(theme.buttonShape);
      if (theme.primaryFont) setPrimaryFont(theme.primaryFont);
    }
  }, [theme]);

  const handleSave = async () => {
    setFeedback(null);

    try {
      await updateTheme({
        primaryColor,
        accentColor,
        buttonShape,
        primaryFont,
      });

      setFeedback({
        type: "success",
        message: "Storefront theme settings updated successfully!",
      });

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update store theme.",
      });
    }
  };

  const getButtonRadius = () => {
    switch (buttonShape) {
      case "PILL":
        return 24;
      case "SQUARE":
        return 2;
      case "ROUNDED":
        return 8;
      case "MEDIUM_ROUNDED":
      default:
        return 12;
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

      {/* Live Storefront Component Preview */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Eye size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Live Storefront Preview</Text>
        </View>

        <View style={styles.previewContainer}>
          <View
            style={[
              styles.previewButton,
              {
                backgroundColor: primaryColor,
                borderRadius: getButtonRadius(),
              },
            ]}
          >
            <Text style={styles.previewButtonText}>Add to Cart</Text>
          </View>

          <View style={styles.previewSecondaryRow}>
            <View
              style={[
                styles.previewBadge,
                {
                  borderColor: accentColor,
                  borderRadius: getButtonRadius(),
                },
              ]}
            >
              <Text style={[styles.previewBadgeText, { color: accentColor }]}>
                Best Seller
              </Text>
            </View>

            <Text style={styles.previewFontLabel}>Font: {primaryFont}</Text>
          </View>
        </View>
      </Card>

      {/* Primary Brand Color Selection */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Palette size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Primary Brand Color</Text>
        </View>

        <Text style={styles.sectionSubtitle}>
          Select a preset palette or enter your brand's custom HEX color:
        </Text>

        {/* Color Swatches Grid */}
        <View style={styles.swatchGrid}>
          {COLOR_PRESETS.map((preset) => {
            const isSelected =
              primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <TouchableOpacity
                key={preset.hex}
                style={[
                  styles.swatchItem,
                  { backgroundColor: preset.hex },
                  isSelected && styles.swatchItemSelected,
                ]}
                onPress={() => setPrimaryColor(preset.hex)}
                activeOpacity={0.8}
              >
                {isSelected && <Check size={16} color={Colors.white} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Custom HEX Code"
          value={primaryColor}
          onChangeText={setPrimaryColor}
          placeholder="#4169E1"
          autoCapitalize="characters"
        />
      </Card>

      {/* Button Shape Selection */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Square size={16} color={Colors.info} />
          <Text style={styles.cardTitle}>Button Shape</Text>
        </View>

        <View style={styles.shapeSelector}>
          {BUTTON_SHAPES.map((shape) => {
            const isSelected = buttonShape === shape.value;
            return (
              <TouchableOpacity
                key={shape.value}
                style={[
                  styles.shapeOption,
                  { borderRadius: shape.radius },
                  isSelected && styles.shapeOptionSelected,
                ]}
                onPress={() => setButtonShape(shape.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.shapeOptionText,
                    isSelected && styles.shapeOptionTextSelected,
                  ]}
                >
                  {shape.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Primary Font Family */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Type size={16} color={Colors.warning} />
          <Text style={styles.cardTitle}>Storefront Font</Text>
        </View>

        <View style={styles.fontList}>
          {FONTS.map((font) => {
            const isSelected = primaryFont === font;
            return (
              <TouchableOpacity
                key={font}
                style={[
                  styles.fontOption,
                  isSelected && styles.fontOptionSelected,
                ]}
                onPress={() => setPrimaryFont(font)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.fontOptionText,
                    isSelected && styles.fontOptionTextSelected,
                  ]}
                >
                  {font}
                </Text>
                {isSelected && <Check size={16} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title={isUpdating ? "Applying Theme..." : "Save Theme Settings"}
        onPress={handleSave}
        loading={isUpdating}
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
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  previewSecondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  previewFontLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 4,
  },
  swatchItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchItemSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  shapeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  shapeOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shapeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(65, 105, 225, 0.15)",
  },
  shapeOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  shapeOptionTextSelected: {
    color: Colors.primaryText,
  },
  fontList: {
    gap: 8,
  },
  fontOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fontOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  },
  fontOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fontOptionTextSelected: {
    fontWeight: "700",
    color: Colors.textPrimary,
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

