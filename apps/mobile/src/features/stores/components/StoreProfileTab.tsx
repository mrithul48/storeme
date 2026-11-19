// apps/mobile/src/features/stores/components/StoreProfileTab.tsx
// Editable store business details and profile management

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Building2,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Instagram,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { StoreWithDetails } from "../../../types";
import { useUpdateStore } from "../../../hooks/use-stores";

interface StoreProfileTabProps {
  store: StoreWithDetails;
}

export const StoreProfileTab: React.FC<StoreProfileTabProps> = ({ store }) => {
  const company = store.company;

  // Form State
  const [storeName, setStoreName] = useState(store.name || "");
  const [businessType, setBusinessType] = useState(company?.businessType || "");
  const [description, setDescription] = useState(company?.description || "");
  const [email, setEmail] = useState(company?.email || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [whatsapp, setWhatsapp] = useState(company?.whatsapp || "");
  const [address, setAddress] = useState(company?.address || "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || "");
  const [instagram, setInstagram] = useState(
    (company?.socialLinks as Record<string, string>)?.instagram || ""
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const updateStoreMutation = useUpdateStore();

  const handleSave = async () => {
    setFeedback(null);

    // Validation
    if (!storeName.trim()) {
      setFeedback({ type: "error", message: "Store name is required." });
      return;
    }

    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      setFeedback({ type: "error", message: "Please provide a valid contact email." });
      return;
    }

    try {
      await updateStoreMutation.mutateAsync({
        name: storeName.trim(),
        company: {
          businessType: businessType.trim() || undefined,
          description: description.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          address: address.trim() || null,
          logoUrl: logoUrl.trim() || null,
          socialLinks: instagram.trim() ? { instagram: instagram.trim() } : null,
        },
      });

      setFeedback({
        type: "success",
        message: "Store profile successfully updated!",
      });

      // Clear success feedback after 4 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update store profile. Please try again.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Feedback Alert Banner */}
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

      {/* Basic Store Info */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Building2 size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Basic Store Profile</Text>
        </View>

        <Input
          label="Store Name *"
          value={storeName}
          onChangeText={setStoreName}
          placeholder="e.g. My Premium Store"
        />

        <Input
          label="Business Category"
          value={businessType}
          onChangeText={setBusinessType}
          placeholder="e.g. Fashion, Electronics, Grocery"
        />

        <Input
          label="Store Tagline / Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description displayed on storefront"
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: "top" }}
        />
      </Card>

      {/* Contact & Location Details */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Mail size={16} color={Colors.info} />
          <Text style={styles.cardTitle}>Contact & Location</Text>
        </View>

        <Input
          label="Customer Support Email"
          value={email}
          onChangeText={setEmail}
          placeholder="support@mystore.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Support Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />

        <Input
          label="Store WhatsApp Number"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="Used for customer WhatsApp inquiries"
          keyboardType="phone-pad"
        />

        <Input
          label="Store Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Store location or registered address"
          multiline
          numberOfLines={2}
          style={{ height: 60, textAlignVertical: "top" }}
        />

        <Input
          label="Instagram Handle"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="@my_store_handle"
          autoCapitalize="none"
        />
      </Card>

      {/* Store Logo Branding */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <ImageIcon size={16} color={Colors.warning} />
          <Text style={styles.cardTitle}>Store Logo URL</Text>
        </View>

        {logoUrl ? (
          <View style={styles.logoPreviewContainer}>
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoPreview}
              resizeMode="contain"
            />
          </View>
        ) : null}

        <Input
          label="Logo Direct Image URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://example.com/logo.png"
          autoCapitalize="none"
        />

        <Text style={styles.helperText}>
          Provide a direct HTTPS image URL for your store logo. Supported formats: PNG, JPG, WebP, SVG.
        </Text>
      </Card>

      {/* Save Button */}
      <Button
        title={updateStoreMutation.isPending ? "Saving Profile..." : "Save Store Profile"}
        onPress={handleSave}
        loading={updateStoreMutation.isPending}
        style={styles.saveButton}
      />
    </KeyboardAvoidingView>
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
  logoPreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoPreview: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
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

