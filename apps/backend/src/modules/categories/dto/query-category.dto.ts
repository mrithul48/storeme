// apps/api/src/modules/categories/dto/query-category.dto.ts
import { CategoryStatus } from '@launchcommerce/shared-types';

export class QueryCategoryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
}

