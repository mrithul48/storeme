// src/types/product.types.ts

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  featured: boolean;
  sku?: string | null;
  images: ProductImage[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends ProductListItem {
  description?: string | null;
  storeId: string;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
  featured?: boolean;
  categoryId?: string;
  brandId?: string;
  images?: { url: string; publicId: string; altText?: string; sortOrder?: number }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
