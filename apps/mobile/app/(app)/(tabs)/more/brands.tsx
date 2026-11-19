// apps/mobile/app/(app)/(tabs)/more/brands.tsx
// Brand management for vendor profiles and manufacturers

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bookmark,
  Plus,
  ArrowLeft,
  X,
  Trash2,
  AlertTriangle,
  Building2,
} from "lucide-react-native";
import { Colors } from "../../../../src/constants/theme";
import { Card } from "../../../../src/components/common/Card";
import { Badge } from "../../../../src/components/common/Badge";
import { Button } from "../../../../src/components/common/Button";
import { Input } from "../../../../src/components/common/Input";
import { EmptyState } from "../../../../src/components/common/EmptyState";
import { Skeleton } from "../../../../src/components/common/LoadingSkeleton";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "../../../../src/hooks/use-brands";
import { Brand } from "../../../../src/types";

export default function BrandsScreen() {
  const router = useRouter();
  const { data: brands = [], isLoading, isRefetching, refetch } = useBrands();

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName("");
    setLogoUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setLogoUrl(b.logoUrl || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Brand name is required.");
      return;
    }
    setFormError(null);

    const payload = {
      name: name.trim(),
      logoUrl: logoUrl.trim() || null,
      status: "ACTIVE" as const,
    };

    try {
      if (editingBrand) {
        await updateMutation.mutateAsync({ id: editingBrand.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save brand.");
    }
  };

  const handleDelete = (b: Brand) => {
    Alert.alert(
      "Delete Brand",
      `Are you sure you want to delete "${b.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(b.id);
              if (editingBrand?.id === b.id) {
                setIsModalOpen(false);
              }
            } catch (err: any) {
              Alert.alert("Delete Failed", err?.message || "Could not delete brand.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Brands</Text>
        <Button
          title="Add"
          variant="primary"
          size="sm"
          icon={<Plus size={14} color={Colors.white} />}
          onPress={openCreateModal}
        />
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: 16 }}>
              <Skeleton width="60%" height={16} borderRadius={4} />
            </Card>
          ))}
        </View>
      ) : brands.length === 0 ? (
        <EmptyState
          title="No Brands Configured"
          description="Add vendor brands and manufacturers for product attribution."
          icon={<Building2 size={40} color={Colors.primaryText} />}
          actionTitle="Add Brand"
          onAction={openCreateModal}
        />
      ) : (
        <FlatList
          data={brands}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={Colors.primaryText}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openEditModal(item)}
            >
              <Card style={styles.brandCard}>
                <View style={styles.brandIconBadge}>
                  <Bookmark size={18} color={Colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brandName}>{item.name}</Text>
                  {item.slug ? (
                    <Text style={styles.brandSlug}>slug: {item.slug}</Text>
                  ) : null}
                </View>
                <Badge
                  label={item.status || "ACTIVE"}
                  variant={item.status === "ACTIVE" ? "success" : "muted"}
                  size="sm"
                />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBrand ? "Edit Brand" : "New Brand"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={{ padding: 4 }}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {formError && (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <View style={{ padding: 20, gap: 12 }}>
              <Input
                label="Brand Name *"
                placeholder="e.g. Nike, Apple, Artisan"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Brand Logo URL"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChangeText={setLogoUrl}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Button
                  title={editingBrand ? "Update Brand" : "Create Brand"}
                  variant="primary"
                  size="lg"
                  loading={createMutation.isPending || updateMutation.isPending}
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />

                {editingBrand && (
                  <Button
                    title="Delete"
                    variant="danger"
                    size="lg"
                    loading={deleteMutation.isPending}
                    icon={<Trash2 size={16} color={Colors.white} />}
                    onPress={() => handleDelete(editingBrand)}
                  />
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.surface,
  },
  brandIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  brandSlug: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
});
