// apps/mobile/src/components/customers/CustomerActionButtons.tsx
// Native action button strip for reaching out to a customer

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Phone, MessageCircle, Mail } from "lucide-react-native";
import { Colors } from "../../constants/theme";
import {
  handleCallCustomer,
  handleWhatsAppCustomer,
  handleEmailCustomer,
} from "./customer-actions";

interface CustomerActionButtonsProps {
  name: string;
  phone?: string | null;
  email?: string | null;
  size?: "compact" | "full";
}

export const CustomerActionButtons: React.FC<CustomerActionButtonsProps> = ({
  name,
  phone,
  email,
  size = "compact",
}) => {
  const hasPhone = Boolean(phone && phone.trim());
  const hasEmail = Boolean(email && email.trim());

  if (size === "full") {
    return (
      <View style={styles.fullContainer}>
        {/* Call Button */}
        <TouchableOpacity
          style={[styles.fullButton, !hasPhone && styles.disabledButton]}
          onPress={() => handleCallCustomer(phone, name)}
          disabled={!hasPhone}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
            <Phone size={18} color="#22C55E" />
          </View>
          <Text style={[styles.fullButtonText, !hasPhone && styles.disabledText]}>Call</Text>
        </TouchableOpacity>

        {/* WhatsApp Button */}
        <TouchableOpacity
          style={[styles.fullButton, !hasPhone && styles.disabledButton]}
          onPress={() => handleWhatsAppCustomer(phone, name)}
          disabled={!hasPhone}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: "rgba(37, 211, 102, 0.15)" }]}>
            <MessageCircle size={18} color="#25D366" />
          </View>
          <Text style={[styles.fullButtonText, !hasPhone && styles.disabledText]}>WhatsApp</Text>
        </TouchableOpacity>

        {/* Email Button */}
        <TouchableOpacity
          style={[styles.fullButton, !hasEmail && styles.disabledButton]}
          onPress={() => handleEmailCustomer(email, name)}
          disabled={!hasEmail}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: "rgba(99, 139, 255, 0.15)" }]}>
            <Mail size={18} color={Colors.primary} />
          </View>
          <Text style={[styles.fullButtonText, !hasEmail && styles.disabledText]}>Email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Compact Mode (for list cards)
  return (
    <View style={styles.compactContainer}>
      {hasPhone && (
        <TouchableOpacity
          style={[styles.compactButton, { borderColor: "rgba(34, 197, 94, 0.3)" }]}
          onPress={() => handleCallCustomer(phone, name)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Phone size={14} color="#22C55E" />
        </TouchableOpacity>
      )}

      {hasPhone && (
        <TouchableOpacity
          style={[styles.compactButton, { borderColor: "rgba(37, 211, 102, 0.3)" }]}
          onPress={() => handleWhatsAppCustomer(phone, name)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MessageCircle size={14} color="#25D366" />
        </TouchableOpacity>
      )}

      {hasEmail && (
        <TouchableOpacity
          style={[styles.compactButton, { borderColor: "rgba(99, 139, 255, 0.3)" }]}
          onPress={() => handleEmailCustomer(email, name)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Mail size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  fullButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  disabledButton: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fullButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
  compactContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
