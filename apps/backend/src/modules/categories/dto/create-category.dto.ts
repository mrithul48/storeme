// apps/api/src/modules/categories/dto/create-category.dto.ts
import { CategoryStatus } from '@launchcommerce/shared-types';

export class CreateCategoryDto {
  name!: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status?: CategoryStatus;
  sortOrder?: number;
}
