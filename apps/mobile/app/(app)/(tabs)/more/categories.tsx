// apps/mobile/app/(app)/(tabs)/more/categories.tsx
// Category management for catalog organization

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
  Tag,
  Plus,
  ArrowLeft,
  X,
  Trash2,
  AlertTriangle,
  FolderTree,
} from "lucide-react-native";
import { Colors } from "../../../../src/constants/theme";
import { Card } from "../../../../src/components/common/Card";
import { Badge } from "../../../../src/components/common/Badge";
import { Button } from "../../../../src/components/common/Button";
import { Input } from "../../../../src/components/common/Input";
import { EmptyState } from "../../../../src/components/common/EmptyState";
import { Skeleton } from "../../../../src/components/common/LoadingSkeleton";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../../src/hooks/use-categories";
import { Category } from "../../../../src/types";

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: categories = [], isLoading, isRefetching, refetch } = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || "");
    setImageUrl(c.imageUrl || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    setFormError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      status: "ACTIVE" as const,
    };

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save category.");
    }
  };

  const handleDelete = (c: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${c.name}"? Products in this category will remain.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(c.id);
              if (editingCategory?.id === c.id) {
                setIsModalOpen(false);
              }
            } catch (err: any) {
              Alert.alert("Delete Failed", err?.message || "Could not delete category.");
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
        <Text style={styles.headerTitle}>Categories</Text>
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
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Yet"
          description="Create categories to organize your catalog products for customers."
          icon={<FolderTree size={40} color={Colors.primaryText} />}
          actionTitle="Create Category"
          onAction={openCreateModal}
        />
      ) : (
        <FlatList
          data={categories}
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
              <Card style={styles.categoryCard}>
                <View style={styles.categoryIconBadge}>
                  <Tag size={18} color={Colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.categoryDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
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
                {editingCategory ? "Edit Category" : "New Category"}
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
                label="Category Name *"
                placeholder="e.g. Footwear"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Description"
                placeholder="Optional description..."
                value={description}
                onChangeText={setDescription}
              />

              <Input
                label="Image URL"
                placeholder="https://example.com/banner.jpg"
                value={imageUrl}
                onChangeText={setImageUrl}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Button
                  title={editingCategory ? "Update Category" : "Create Category"}
                  variant="primary"
                  size="lg"
                  loading={createMutation.isPending || updateMutation.isPending}
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />

                {editingCategory && (
                  <Button
                    title="Delete"
                    variant="danger"
                    size="lg"
                    loading={deleteMutation.isPending}
                    icon={<Trash2 size={16} color={Colors.white} />}
                    onPress={() => handleDelete(editingCategory)}
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
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.surface,
  },
  categoryIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  categoryDesc: {
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

