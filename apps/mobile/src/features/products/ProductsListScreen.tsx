// apps/mobile/src/features/products/ProductsListScreen.tsx
// Comprehensive product management screen with live search, filters, creation, and editing

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/LoadingSkeleton";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../hooks/use-products";
import { useCategories } from "../../hooks/use-categories";
import { useBrands } from "../../hooks/use-brands";
import { useAuthStore } from "../../stores/auth-store";
import { Product, ProductVariant } from "../../types";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DRAFT";

export const ProductsListScreen: React.FC = () => {
  const store = useAuthStore((state) => state.store);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "DRAFT">("ACTIVE");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<Array<{ color: string; stock: number }>>([]);
  const [newColor, setNewColor] = useState("");
  const [newColorStock, setNewColorStock] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const {
    data: productsData,
    isLoading,
    isRefetching,
    refetch,
  } = useProducts({
    search: search.trim() || undefined,
    status: activeFilter === "ALL" ? undefined : activeFilter,
  });

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.data || [];

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setSalePrice("");
    setSku("");
    setStock("0");
    setStatus("ACTIVE");
    setCategoryId(categories.length > 0 ? categories[0].id : null);
    setBrandId(null);
    setImageUrl("");
    setVariants([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setSalePrice(p.salePrice ? String(p.salePrice) : "");
    setSku(p.sku || "");
    setStock(String(p.stock ?? 0));
    setStatus(p.status);
    setCategoryId(p.categoryId || null);
    setBrandId(p.brandId || null);
    setImageUrl(p.images?.[0]?.url || "");
    setVariants(
      (p.variants || []).map((v) => ({
        color: v.color,
        stock: v.stock ?? 0,
      }))
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newColor.trim()) return;
    setVariants((prev) => [
      ...prev,
      { color: newColor.trim(), stock: parseInt(newColorStock, 10) || 0 },
    ]);
    setNewColor("");
    setNewColorStock("");
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError("Valid product price is required.");
      return;
    }

    setFormError(null);
    const numSalePrice = salePrice ? parseFloat(salePrice) : null;
    const numStock = parseInt(stock, 10) || 0;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: numPrice,
      salePrice: numSalePrice,
      sku: sku.trim() || null,
      stock: numStock,
      inStock: numStock > 0,
      status,
      categoryId: categoryId || null,
      brandId: brandId || null,
      images: imageUrl.trim()
        ? [{ url: imageUrl.trim(), publicId: `prod_${Date.now()}` }]
        : [],
      variants: variants.map((v) => ({
        color: v.color,
        stock: v.stock,
        inStock: v.stock > 0,
      })),
    };

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save product. Please try again.");
    }
  };

  const handleDeleteProduct = (p: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(p.id);
              if (editingProduct?.id === p.id) {
                setIsModalOpen(false);
              }
            } catch (err: any) {
              Alert.alert("Delete Failed", err?.message || "Could not delete product.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products Catalog</Text>
          <Text style={styles.storeName}>{store?.name || "Merchant Store"}</Text>
        </View>
        <Button
          title="Add Product"
          variant="primary"
          size="sm"
          icon={<Plus size={16} color={Colors.white} />}
          onPress={openCreateModal}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search products by title or SKU..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(["ALL", "ACTIVE", "INACTIVE", "DRAFT"] as StatusFilter[]).map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(tab)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <Skeleton width={56} height={56} borderRadius={10} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="75%" height={16} borderRadius={4} />
                  <Skeleton width="45%" height={12} borderRadius={4} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={
            search
              ? `No products matched "${search}".`
              : "No products in this category yet. Tap 'Add Product' to get started."
          }
          icon={<Package size={40} color={Colors.primaryText} />}
          actionTitle="Add New Product"
          onAction={openCreateModal}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
          renderItem={({ item }) => {
            const hasDiscount = item.salePrice && item.salePrice < item.price;
            const isOutOfStock = (item.stock ?? 0) <= 0 || !item.inStock;
            const isLowStock = !isOutOfStock && (item.stock ?? 0) <= 5;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openEditModal(item)}
              >
                <Card style={styles.productCard}>
                  <View style={styles.productRow}>
                    {/* Thumbnail Image or Icon */}
                    <View style={styles.thumbnailContainer}>
                      {item.images?.[0]?.url ? (
                        <Image
                          source={{ uri: item.images[0].url }}
                          style={styles.thumbnailImage}
                        />
                      ) : (
                        <Package size={26} color={Colors.textMuted} />
                      )}
                    </View>

                    {/* Product Info */}
                    <View style={styles.productInfo}>
                      <View style={styles.titleRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Badge
                          label={item.status}
                          variant={
                            item.status === "ACTIVE"
                              ? "success"
                              : item.status === "DRAFT"
                              ? "warning"
                              : "muted"
                          }
                          size="sm"
                        />
                      </View>

                      {/* SKU and Category */}
                      <View style={styles.metaRow}>
                        {item.sku ? (
                          <Text style={styles.skuText}>SKU: {item.sku}</Text>
                        ) : null}
                        {item.category ? (
                          <View style={styles.categoryChip}>
                            <Tag size={10} color={Colors.textSecondary} />
                            <Text style={styles.categoryText}>
                              {item.category.name}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Price & Stock status */}
                      <View style={styles.priceStockRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.currentPrice}>
                            ₹{(hasDiscount ? item.salePrice! : item.price).toLocaleString("en-IN")}
                          </Text>
                          {hasDiscount && (
                            <Text style={styles.originalPrice}>
                              ₹{item.price.toLocaleString("en-IN")}
                            </Text>
                          )}
                        </View>

                        <Badge
                          label={
                            isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                              ? `Low (${item.stock} left)`
                              : `${item.stock} in stock`
                          }
                          variant={
                            isOutOfStock
                              ? "danger"
                              : isLowStock
                              ? "warning"
                              : "muted"
                          }
                          size="sm"
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Create / Edit Product Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? "Edit Product" : "New Product"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.closeBtn}
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

            <ScrollView
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Basic Information */}
              <Text style={styles.sectionHeading}>Basic Information</Text>

              <Input
                label="Product Title *"
                placeholder="e.g. Premium Cotton Shirt"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="SKU / Barcode"
                placeholder="e.g. SHIRT-WHT-001"
                value={sku}
                onChangeText={setSku}
              />

              <Input
                label="Description"
                placeholder="Product description and details..."
                multiline
                numberOfLines={3}
                inputStyle={{ height: 80, textAlignVertical: "top" }}
                value={description}
                onChangeText={setDescription}
              />

              {/* Pricing & Stock */}
              <Text style={styles.sectionHeading}>Pricing & Stock</Text>

              <View style={styles.twoColumnRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Regular Price (₹) *"
                    placeholder="999"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Sale Price (₹)"
                    placeholder="799"
                    keyboardType="numeric"
                    value={salePrice}
                    onChangeText={setSalePrice}
                  />
                </View>
              </View>

              <Input
                label="Total Units in Stock"
                placeholder="50"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />

              {/* Status Picker */}
              <Text style={styles.inputLabel}>Product Status</Text>
              <View style={styles.statusRow}>
                {(["ACTIVE", "INACTIVE", "DRAFT"] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    activeOpacity={0.7}
                    onPress={() => setStatus(st)}
                    style={[
                      styles.statusSelectChip,
                      status === st && styles.statusSelectChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        status === st && styles.statusSelectTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category Picker */}
              {categories.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                  >
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          setCategoryId(categoryId === c.id ? null : c.id)
                        }
                        style={[
                          styles.catChip,
                          categoryId === c.id && styles.catChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.catChipText,
                            categoryId === c.id && styles.catChipTextActive,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Brand Picker */}
              {brands.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Brand</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                  >
                    {brands.map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          setBrandId(brandId === b.id ? null : b.id)
                        }
                        style={[
                          styles.catChip,
                          brandId === b.id && styles.catChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.catChipText,
                            brandId === b.id && styles.catChipTextActive,
                          ]}
                        >
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Product Image URL */}
              <View style={{ marginTop: 12 }}>
                <Input
                  label="Product Image URL"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>

              {/* Color Variants */}
              <Text style={styles.sectionHeading}>Color Variants</Text>
              {variants.map((v, idx) => (
                <View key={idx} style={styles.variantRow}>
                  <View style={styles.variantTag}>
                    <Text style={styles.variantColorText}>{v.color}</Text>
                    <Text style={styles.variantStockText}>({v.stock} units)</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveVariant(idx)}
                    style={styles.variantRemoveBtn}
                  >
                    <X size={14} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addVariantRow}>
                <View style={{ flex: 2 }}>
                  <Input
                    placeholder="Color (e.g. Navy)"
                    value={newColor}
                    onChangeText={setNewColor}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Stock"
                    keyboardType="numeric"
                    value={newColorStock}
                    onChangeText={setNewColorStock}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <Button
                  title="Add"
                  variant="outline"
                  size="sm"
                  onPress={handleAddVariant}
                />
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <Button
                  title={editingProduct ? "Save Changes" : "Create Product"}
                  variant="primary"
                  size="lg"
                  loading={createMutation.isPending || updateMutation.isPending}
                  onPress={handleSaveProduct}
                  style={{ flex: 1 }}
                />

                {editingProduct && (
                  <Button
                    title="Delete"
                    variant="danger"
                    size="lg"
                    loading={deleteMutation.isPending}
                    icon={<Trash2 size={16} color={Colors.white} />}
                    onPress={() => handleDeleteProduct(editingProduct)}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  storeName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  skeletonCard: {
    padding: 14,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productCard: {
    padding: 12,
    backgroundColor: Colors.surface,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  skuText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  priceStockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statusSelectChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statusSelectChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusSelectText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusSelectTextActive: {
    color: Colors.white,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryText,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.primaryText,
    fontWeight: "700",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  variantTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  variantColorText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  variantStockText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  variantRemoveBtn: {
    padding: 4,
  },
  addVariantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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

