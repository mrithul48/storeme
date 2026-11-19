// apps/mobile/app/(app)/(tabs)/more/index.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Boxes,
  Tag,
  Bookmark,
  Users,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Store as StoreIcon,
} from "lucide-react-native";
import { Colors } from "../../../../src/constants/theme";
import { Card } from "../../../../src/components/common/Card";
import { Badge } from "../../../../src/components/common/Badge";
import { useAuthStore } from "../../../../src/stores/auth-store";

export default function MoreScreen() {
  const router = useRouter();
  const { user, store, logout } = useAuthStore();

  const menuSections = [
    {
      title: "Store Management",
      items: [
        {
          title: "Inventory",
          subtitle: "Stock levels, replenishment & color variants",
          icon: <Boxes size={20} color={Colors.primaryText} />,
          route: "/(app)/(tabs)/more/inventory",
          badge: "Phase 2",
        },
        {
          title: "Categories",
          subtitle: "Organize products into collections",
          icon: <Tag size={20} color={Colors.textSecondary} />,
          route: "/(app)/(tabs)/more/categories",
        },
        {
          title: "Brands",
          subtitle: "Vendor brands and manufacturer profiles",
          icon: <Bookmark size={20} color={Colors.textSecondary} />,
          route: "/(app)/(tabs)/more/brands",
        },
        {
          title: "Customers",
          subtitle: "Buyer database and purchase history",
          icon: <Users size={20} color={Colors.primaryText} />,
          route: "/(app)/(tabs)/more/customers",
          badge: "Phase 4",
        },
      ],
    },
    {
      title: "Settings & Account",
      items: [
        {
          title: "Store Settings",
          subtitle: "Store profile, policies & custom domains",
          icon: <Settings size={20} color={Colors.primaryText} />,
          route: "/(app)/(tabs)/more/settings",
          badge: "Phase 5",
        },
        {
          title: "Subscription & Billing",
          subtitle: "Current plan, quota limits & billing cycle",
          icon: <CreditCard size={20} color={Colors.primaryText} />,
          route: "/(app)/(tabs)/more/subscription",
          badge: "Phase 6",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Store Profile Card */}
        <Card style={styles.storeCard}>
          <View style={styles.storeAvatar}>
            <StoreIcon size={24} color={Colors.primaryText} />
          </View>
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store?.name || "Merchant Store"}</Text>
            <Text style={styles.userEmail}>{user?.email || "merchant@store.com"}</Text>
          </View>
          <Badge label={store?.status || "ACTIVE"} variant="success" dot size="sm" />
        </Card>

        {/* Menu Sections */}
        {menuSections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionHeader}>{sec.title}</Text>
            <Card style={styles.menuCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.7}
                  onPress={() => item.route && router.push(item.route as any)}
                  style={[
                    styles.menuItem,
                    idx < sec.items.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <View style={styles.itemIcon}>{item.icon}</View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.badge ? (
                        <Badge label={item.badge} variant="primary" size="sm" />
                      ) : null}
                    </View>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => logout()}
          style={styles.logoutBtn}
        >
          <LogOut size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
    backgroundColor: Colors.surface,
  },
  storeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.danger,
  },
});

