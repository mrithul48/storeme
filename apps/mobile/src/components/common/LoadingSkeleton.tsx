// apps/mobile/src/components/common/LoadingSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const InventoryListSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.cardSkeleton}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="40%" height={12} />
            </View>
            <Skeleton width={60} height={24} borderRadius={12} />
          </View>
          <View style={styles.cardFooter}>
            <Skeleton width={100} height={28} borderRadius={8} />
            <Skeleton width={120} height={36} borderRadius={10} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const CustomerListSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.cardSkeleton}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
              <Skeleton width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="80%" height={12} />
              </View>
            </View>
            <Skeleton width={70} height={24} borderRadius={12} />
          </View>
          <View style={styles.cardFooter}>
            <Skeleton width={120} height={24} borderRadius={6} />
            <Skeleton width={100} height={24} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const CustomerDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      {/* Profile Header */}
      <View style={[styles.cardSkeleton, { alignItems: "center", paddingVertical: 24, gap: 12 }]}>
        <Skeleton width={72} height={72} borderRadius={36} />
        <Skeleton width={160} height={20} />
        <Skeleton width={200} height={14} />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Skeleton width={90} height={36} borderRadius={18} />
          <Skeleton width={90} height={36} borderRadius={18} />
          <Skeleton width={90} height={36} borderRadius={18} />
        </View>
      </View>

      {/* Metrics Row */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[styles.cardSkeleton, { flex: 1, height: 80 }]} />
        <View style={[styles.cardSkeleton, { flex: 1, height: 80 }]} />
      </View>

      {/* Orders Section */}
      <Skeleton width={140} height={20} style={{ marginVertical: 8 }} />
      {[1, 2, 3].map((key) => (
        <View key={key} style={[styles.cardSkeleton, { height: 70 }]} />
      ))}
    </View>
  );
};

export const StoreSettingsSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      <View style={[styles.cardSkeleton, { alignItems: "center", paddingVertical: 24, gap: 12 }]}>
        <Skeleton width={70} height={70} borderRadius={16} />
        <Skeleton width={180} height={20} />
        <Skeleton width={130} height={14} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
        <Skeleton width={100} height={36} borderRadius={18} />
        <Skeleton width={100} height={36} borderRadius={18} />
        <Skeleton width={100} height={36} borderRadius={18} />
      </View>
      <View style={[styles.cardSkeleton, { height: 180 }]} />
      <View style={[styles.cardSkeleton, { height: 140 }]} />
    </View>
  );
};

export const SubscriptionSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      {/* Current plan card skeleton */}
      <View style={[styles.cardSkeleton, { paddingVertical: 20, gap: 14 }]}>
        <View style={styles.cardHeader}>
          <Skeleton width={120} height={20} />
          <Skeleton width={70} height={24} borderRadius={12} />
        </View>
        <Skeleton width={160} height={32} />
        <Skeleton width="90%" height={14} />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Skeleton width="48%" height={40} borderRadius={10} />
          <Skeleton width="48%" height={40} borderRadius={10} />
        </View>
      </View>

      {/* Limits & Usage Skeleton */}
      <View style={[styles.cardSkeleton, { height: 130 }]} />

      {/* Available Plans Skeleton */}
      <Skeleton width={150} height={22} style={{ marginVertical: 6 }} />
      {[1, 2].map((k) => (
        <View key={k} style={[styles.cardSkeleton, { height: 200 }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  cardSkeleton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
