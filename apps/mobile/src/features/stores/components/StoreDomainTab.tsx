// apps/mobile/src/features/stores/components/StoreDomainTab.tsx
// Custom domain connection, DNS verification, and domain status management

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Unlink,
  Info,
} from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { StoreWithDetails } from "../../../types";
import { useCustomDomain } from "../../../hooks/use-stores";

interface StoreDomainTabProps {
  store: StoreWithDetails;
}

export const StoreDomainTab: React.FC<StoreDomainTabProps> = ({ store }) => {
  const {
    domainDetails,
    registerDomain,
    isRegistering,
    verifyDomain,
    isVerifying,
    disconnectDomain,
    isDisconnecting,
    refetch,
  } = useCustomDomain();

  const activeDomain = domainDetails?.domain || store.customDomain;
  const domainStatus = domainDetails?.status || store.domainStatus || "NONE";

  const [inputDomain, setInputDomain] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleConnect = async () => {
    setFeedback(null);
    const domain = inputDomain.trim().toLowerCase().replace(/^https?:\/\//, "");

    if (!domain) {
      setFeedback({ type: "error", message: "Please enter a valid domain name." });
      return;
    }

    try {
      await registerDomain(domain);
      setInputDomain("");
      setFeedback({
        type: "success",
        message: `Domain ${domain} registered! Configure your DNS records to complete verification.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to register custom domain.",
      });
    }
  };

  const handleVerify = async () => {
    setFeedback(null);
    try {
      const res = await verifyDomain();
      if (res.verified) {
        setFeedback({
          type: "success",
          message: "DNS verified successfully! SSL certificate is active.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || "DNS records not detected yet. DNS propagation can take up to 24-48 hours.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Domain verification failed.",
      });
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect Domain",
      `Are you sure you want to disconnect ${activeDomain}? Shoppers will no longer be able to access your store via this domain.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await disconnectDomain();
              setFeedback({
                type: "success",
                message: "Domain disconnected successfully.",
              });
            } catch (err: any) {
              setFeedback({
                type: "error",
                message: err?.message || "Failed to disconnect domain.",
              });
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = () => {
    switch (domainStatus) {
      case "CONNECTED":
        return <Badge label="CONNECTED" variant="success" size="sm" />;
      case "PENDING":
        return <Badge label="PENDING DNS" variant="warning" size="sm" />;
      case "FAILED":
        return <Badge label="FAILED" variant="danger" size="sm" />;
      default:
        return <Badge label="NOT CONNECTED" variant="muted" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Feedback Banner */}
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

      {/* Active Domain Status Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Globe size={16} color={Colors.primary} />
          <Text style={styles.cardTitle}>Custom Domain Status</Text>
        </View>

        {activeDomain ? (
          <View style={styles.activeDomainSection}>
            <View style={styles.domainRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.domainName}>{activeDomain}</Text>
                <Text style={styles.domainSub}>
                  {domainStatus === "CONNECTED"
                    ? "SSL is active and traffic is routed"
                    : "Awaiting DNS record propagation"}
                </Text>
              </View>
              {getStatusBadge()}
            </View>

            {/* Action Buttons for active domain */}
            <View style={styles.domainActionsRow}>
              <Button
                title={isVerifying ? "Verifying..." : "Verify DNS"}
                variant="outline"
                size="sm"
                onPress={handleVerify}
                loading={isVerifying}
                style={{ flex: 1 }}
              />
              <Button
                title={isDisconnecting ? "Disconnecting..." : "Disconnect"}
                variant="danger"
                size="sm"
                onPress={handleDisconnect}
                loading={isDisconnecting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.noDomainSection}>
            <Text style={styles.noDomainTitle}>No Custom Domain Connected</Text>
            <Text style={styles.noDomainText}>
              Your store is currently accessed via:{" "}
              <Text style={{ color: Colors.primaryText, fontWeight: "600" }}>
                {store.slug}.launchcommerce.com
              </Text>
            </Text>
          </View>
        )}
      </Card>

      {/* Connect New Domain Form (shown if no domain connected) */}
      {!activeDomain ? (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={16} color={Colors.info} />
            <Text style={styles.cardTitle}>Connect New Domain</Text>
          </View>

          <Input
            label="Domain Name"
            value={inputDomain}
            onChangeText={setInputDomain}
            placeholder="shop.yourbrand.com or yourbrand.com"
            autoCapitalize="none"
          />

          <Button
            title={isRegistering ? "Connecting Domain..." : "Connect Domain"}
            onPress={handleConnect}
            loading={isRegistering}
          />
        </Card>
      ) : null}

      {/* DNS Setup Guide Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Info size={16} color={Colors.textMuted} />
          <Text style={styles.cardTitle}>DNS Configuration Instructions</Text>
        </View>

        <Text style={styles.dnsInstructionText}>
          Add the following CNAME record in your domain registrar (GoDaddy, Namecheap, Cloudflare, Route53):
        </Text>

        <View style={styles.dnsTable}>
          <View style={styles.dnsHeaderRow}>
            <Text style={styles.dnsHeaderCell}>Type</Text>
            <Text style={styles.dnsHeaderCell}>Name / Host</Text>
            <Text style={styles.dnsHeaderCell}>Target / Value</Text>
          </View>
          <View style={styles.dnsDataRow}>
            <Text style={styles.dnsDataCell}>CNAME</Text>
            <Text style={styles.dnsDataCell}>@ or www</Text>
            <Text style={[styles.dnsDataCell, { color: Colors.primaryText }]}>
              stores.launchcommerce.com
            </Text>
          </View>
        </View>

        <Text style={styles.dnsNote}>
          Note: DNS propagation typically takes between 15 minutes to 24 hours depending on your registrar TTL settings.
        </Text>
      </Card>
    </View>
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
  activeDomainSection: {
    gap: 14,
  },
  domainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  domainName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  domainSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  domainActionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 8,
  },
  noDomainSection: {
    gap: 6,
  },
  noDomainTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  noDomainText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dnsInstructionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dnsTable: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  dnsHeaderRow: {
    flexDirection: "row",
    backgroundColor: "rgba(32, 45, 85, 0.4)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dnsHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  dnsDataRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dnsDataCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  dnsNote: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    fontStyle: "italic",
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

