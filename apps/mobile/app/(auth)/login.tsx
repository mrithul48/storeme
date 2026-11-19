// apps/mobile/app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Lock, Mail, Store, AlertCircle, Eye, EyeOff } from "lucide-react-native";
import { Colors } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { useAuthStore } from "../../src/stores/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim()) {
      setValidationError("Please enter your merchant email address.");
      return;
    }
    if (!password) {
      setValidationError("Please enter your password.");
      return;
    }

    setValidationError(null);
    clearError();

    const success = await login(email, password);
    if (success) {
      router.replace("/(app)/(tabs)" as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Logo & Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Store size={32} color={Colors.white} />
            </View>
            <Text style={styles.brandTitle}>LaunchCommerce</Text>
            <Text style={styles.brandSubtitle}>Merchant Mobile Portal</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formDesc}>
              Enter your credentials to access your store inventory and orders.
            </Text>

            {(validationError || error) && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{validationError || error}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="merchant@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError(null);
              }}
              leftIcon={<Mail size={18} color={Colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError(null);
              }}
              leftIcon={<Lock size={18} color={Colors.textMuted} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.textMuted} />
                  ) : (
                    <Eye size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <Button
              title="Sign In to Store"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: "500",
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
});
