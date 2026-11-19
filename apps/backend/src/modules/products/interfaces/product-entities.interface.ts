// apps/backend/src/modules/products/interfaces/product-entities.interface.ts

export interface ProductImageEntity {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductVariantImageEntity {
  id: string;
  variantId: string;
  url: string;
  publicId: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductVariantEntity {
  id: string;
  productId: string;
  color: string;
  manageAvailability: boolean;
  inStock: boolean;
  manageQuantity: boolean;
  stock: number;
  sortOrder: number;
  images?: ProductVariantImageEntity[];
}

export interface ProductEntity {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  weight: number | null;
  stock: number;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  inStock: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  featured: boolean;
  categoryId: string | null;
  brandId: string | null;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImageEntity[];
  variants?: ProductVariantEntity[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
}

