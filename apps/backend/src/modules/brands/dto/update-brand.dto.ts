// apps/api/src/modules/brands/dto/update-brand.dto.ts
import { BrandStatus } from '@launchcommerce/shared-types';

export class UpdateBrandDto {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  status?: BrandStatus;
}

