// apps/backend/src/modules/categories/interfaces/category-entities.interface.ts

export interface CategoryEntity {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithCount extends CategoryEntity {
  productCount: number;
  _count: { products: number };
}

export interface CategoryDetailProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
}

export interface CategoryDetail extends CategoryWithCount {
  products: CategoryDetailProduct[];
}

