// apps/mobile/src/components/customers/CustomerCard.tsx
// Merchant customer card for LaunchCommerce list views

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Mail, Phone, Calendar, ShoppingBag } from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { Badge } from "../common/Badge";
import { CustomerListItem } from "../../types";
import { CustomerActionButtons } from "./CustomerActionButtons";

interface CustomerCardProps {
  customer: CustomerListItem;
  onPress: () => void;
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
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

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
}) => {
  const initials = getInitials(customer.name);
  const formattedSpend = `₹${(Number(customer.totalSpent) || 0).toLocaleString("en-IN")}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Section: Avatar + Name + Chevron */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {customer.name || "Unnamed Customer"}
          </Text>
          <View style={styles.joinedRow}>
            <Calendar size={12} color={Colors.textMuted} />
            <Text style={styles.joinedText}>
              Joined {formatDate(customer.createdAt)}
            </Text>
          </View>
        </View>

        <ChevronRight size={18} color={Colors.textMuted} />
      </View>

      {/* Middle Section: Contact Details */}
      <View style={styles.contactSection}>
        {customer.email ? (
          <View style={styles.contactItem}>
            <Mail size={13} color={Colors.textSecondary} />
            <Text style={styles.contactText} numberOfLines={1}>
              {customer.email}
            </Text>
          </View>
        ) : null}

        {customer.phone ? (
          <View style={styles.contactItem}>
            <Phone size={13} color={Colors.textSecondary} />
            <Text style={styles.contactText} numberOfLines={1}>
              {customer.phone}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom Section: Order Metrics + Quick Actions */}
      <View style={styles.footer}>
        <View style={styles.metricsGroup}>
          <Badge
            label={`${customer.totalOrders} ${customer.totalOrders === 1 ? "order" : "orders"}`}
            variant="muted"
            size="sm"
          />
          <View style={styles.spendTag}>
            <Text style={styles.spendLabel}>Spent:</Text>
            <Text style={styles.spendValue}>{formattedSpend}</Text>
          </View>
        </View>

        <CustomerActionButtons
          name={customer.name}
          phone={customer.phone}
          email={customer.email}
          size="compact"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryText,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  joinedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  joinedText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  contactSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metricsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spendTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spendLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  spendValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryText,
  },
});
