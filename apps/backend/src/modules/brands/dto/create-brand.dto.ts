// apps/api/src/modules/brands/dto/create-brand.dto.ts
import { BrandStatus } from '@launchcommerce/shared-types';

export class CreateBrandDto {
  name!: string;
  slug?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  status?: BrandStatus;
}
