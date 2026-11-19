// apps/mobile/src/components/common/SearchInput.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { Colors } from "../../constants/theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  style?: StyleProp<ViewStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "Search by product name or SKU...",
  debounceMs = 300,
  style,
}) => {
  const [localText, setLocalText] = useState(value);

  // Sync if parent value changes
  useEffect(() => {
    setLocalText(value);
  }, [value]);

  // Debounced callback to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localText !== value) {
        onChangeText(localText);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localText, debounceMs, onChangeText, value]);

  const handleClear = () => {
    setLocalText("");
    onChangeText("");
  };

  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={Colors.textMuted} style={styles.icon} />
      <TextInput
        value={localText}
        onChangeText={setLocalText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {localText.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    height: "100%",
  },
});
