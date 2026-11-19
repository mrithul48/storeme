// apps/api/src/modules/products/dto/update-product.dto.ts
import { ProductStatus } from '@launchcommerce/shared-types';
import { ProductImageDto, ProductVariantDto } from './create-product.dto';

export class UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
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

