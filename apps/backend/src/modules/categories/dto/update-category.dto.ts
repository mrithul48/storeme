// apps/api/src/modules/categories/dto/update-category.dto.ts
import { CategoryStatus } from '@launchcommerce/shared-types';

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status?: CategoryStatus;
  sortOrder?: number;
}

