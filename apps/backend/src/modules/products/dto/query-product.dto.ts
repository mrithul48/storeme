// apps/api/src/modules/products/dto/query-product.dto.ts
import { ProductStatus } from '@launchcommerce/shared-types';

export class QueryProductDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  brandId?: string;
  featured?: boolean | string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

