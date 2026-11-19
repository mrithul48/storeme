// apps/backend/src/modules/brands/interfaces/brand-entities.interface.ts

export interface BrandEntity {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandWithCount extends BrandEntity {
  productCount: number;
  _count: { products: number };
}

export interface BrandDetailProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
}

export interface BrandDetail extends BrandWithCount {
  products: BrandDetailProduct[];
}

