// apps/mobile/src/components/common/Card.tsx
import React from "react";
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants/theme";

interface CardProps extends ViewProps {
  elevated?: boolean;
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  highlighted = false,
  style,
  children,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        elevated && styles.elevated,
        highlighted && styles.highlighted,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  highlighted: {
    borderColor: Colors.borderActive,
    backgroundColor: Colors.surfaceMuted,
  },
});
