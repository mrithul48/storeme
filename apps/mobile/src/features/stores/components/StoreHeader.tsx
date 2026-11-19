// apps/mobile/src/features/stores/components/StoreHeader.tsx
// Store profile header with logo, storefront link, status badge, and quick actions

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  Alert,
} from "react-native";
import {
  Store as StoreIcon,
  ExternalLink,
  Share2,
  Globe,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Badge } from "../../../components/common/Badge";
import { StoreWithDetails } from "../../../types";

interface StoreHeaderProps {
  store: StoreWithDetails;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  const storeUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://${store.slug}.launchcommerce.com`;

  const handleOpenStore = async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch {
      Alert.alert("Error", `Could not open storefront link: ${storeUrl}`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: store.name,
        message: `Visit my online store: ${storeUrl}`,
        url: storeUrl,
      });
    } catch {
      // User cancelled or share failed
    }
  };

  const logoUrl = store.company?.logoUrl;
  const statusVariant =
    store.status === "ACTIVE"
      ? "success"
      : store.status === "SUSPENDED"
      ? "danger"
      : "warning";

  return (
    <View style={styles.container}>
      {/* Top Profile Strip */}
      <View style={styles.topRow}>
        <View style={styles.logoWrapper}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackLogo}>
              <StoreIcon size={28} color={Colors.primaryText} />
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
            <Badge
              label={store.status}
              variant={statusVariant}
              size="sm"
            />
          </View>

          <TouchableOpacity
            style={styles.urlRow}
            onPress={handleOpenStore}
            activeOpacity={0.7}
          >
            <Globe size={12} color={Colors.primaryText} />
            <Text style={styles.urlText} numberOfLines={1}>
              {store.customDomain || `${store.slug}.launchcommerce.com`}
            </Text>
            <ExternalLink size={12} color={Colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Strip */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenStore}
          activeOpacity={0.7}
        >
          <ExternalLink size={15} color={Colors.textPrimary} />
          <Text style={styles.actionButtonText}>View Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Share2 size={15} color={Colors.textPrimary} />
          <Text style={styles.actionButtonText}>Share Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  fallbackLogo: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  urlText: {
    fontSize: 12,
    color: Colors.primaryText,
    fontWeight: "500",
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});

