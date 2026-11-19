// apps/api/src/modules/products/dto/create-product.dto.ts
import { ProductStatus } from '@launchcommerce/shared-types';

export class ProductImageDto {
  url!: string;
  publicId!: string;
  altText?: string | null;
  sortOrder?: number;
}

export class ProductVariantDto {
  id?: string;
  color!: string;
  manageAvailability?: boolean;
  inStock?: boolean;
  manageQuantity?: boolean;
  stock?: number;
  sortOrder?: number;
  images?: ProductImageDto[];
}

export class CreateProductDto {
  name!: string;
  slug?: string;
  description?: string | null;
  price!: number;
  salePrice?: number | null;
  sku?: string | null;
  weight?: number | null;
  stock?: number;
  inStock?: boolean;
  status?: ProductStatus;
  featured?: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  images?: ProductImageDto[];
  variants?: ProductVariantDto[];
}
