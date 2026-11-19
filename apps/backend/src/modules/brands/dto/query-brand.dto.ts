// apps/api/src/modules/brands/dto/query-brand.dto.ts
import { BrandStatus } from '@launchcommerce/shared-types';

export class QueryBrandDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: BrandStatus;
}

