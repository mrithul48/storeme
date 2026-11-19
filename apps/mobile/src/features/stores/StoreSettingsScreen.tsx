// apps/mobile/src/features/stores/StoreSettingsScreen.tsx
// Comprehensive store management, configuration, branding, and domain settings

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Store as StoreIcon,
  Layers,
  Palette,
  Globe,
  Building2,
  AlertCircle,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { EmptyState } from "../../components/common/EmptyState";
import { StoreSettingsSkeleton } from "../../components/common/LoadingSkeleton";
import { StoreHeader } from "./components/StoreHeader";
import { StoreOverviewTab } from "./components/StoreOverviewTab";
import { StoreProfileTab } from "./components/StoreProfileTab";
import { StoreOperationsTab } from "./components/StoreOperationsTab";
import { StoreThemeTab } from "./components/StoreThemeTab";
import { StoreDomainTab } from "./components/StoreDomainTab";
import { useCurrentStore } from "../../hooks/use-stores";

type ActiveTab = "OVERVIEW" | "PROFILE" | "OPERATIONS" | "THEME" | "DOMAIN";

interface TabItem {
  key: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export const StoreSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("OVERVIEW");

  const { store, isLoading, isFetching, error, refetch } = useCurrentStore();

  const tabs: TabItem[] = [
    {
      key: "OVERVIEW",
      label: "Overview",
      icon: (
        <StoreIcon
          size={14}
          color={activeTab === "OVERVIEW" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "PROFILE",
      label: "Profile",
      icon: (
        <Building2
          size={14}
          color={activeTab === "PROFILE" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "OPERATIONS",
      label: "Operations",
      icon: (
        <Layers
          size={14}
          color={activeTab === "OPERATIONS" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "THEME",
      label: "Theme",
      icon: (
        <Palette
          size={14}
          color={activeTab === "THEME" ? Colors.primaryText : Colors.textMuted}
        />
      ),
    },
    {
      key: "DOMAIN",
      label: "Domain",
      icon: (
        <Globe
          size={14}
          color={activeTab === "DOMAIN" ? Colors.primaryText : Colors.textMuted}
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
        <Text style={styles.headerTitle}>Store Management</Text>
      </View>

      {isLoading ? (
        <StoreSettingsSkeleton />
      ) : error || !store ? (
        <View style={styles.centerContainer}>
          <EmptyState
            title="Failed to Load Store"
            description={error || "Could not retrieve store settings from the server."}
            icon={<AlertCircle size={48} color={Colors.danger} />}
            actionTitle="Try Again"
            onAction={() => {
              refetch();
            }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Store Overview Card */}
          <StoreHeader store={store} />

          {/* Section Navigation Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
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
          </ScrollView>

          {/* Active Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "OVERVIEW" && <StoreOverviewTab store={store} />}
            {activeTab === "PROFILE" && <StoreProfileTab store={store} />}
            {activeTab === "OPERATIONS" && <StoreOperationsTab store={store} />}
            {activeTab === "THEME" && (
              <StoreThemeTab initialTheme={store.theme} />
            )}
            {activeTab === "DOMAIN" && <StoreDomainTab store={store} />}
          </View>
        </ScrollView>
      )}
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
  tabBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
  tabContent: {
    marginTop: 4,
  },
});

