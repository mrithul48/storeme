// apps/backend/src/modules/stores/dto/create-store.dto.ts
export class CreateStoreDto {
  businessName!: string;
  businessType!: string;
  businessAddress?: string;
  logoUrl?: string;
  logoPublicId?: string;
  whatsapp?: string;
  email?: string;
  description?: string;
  phone?: string;
  socialLinks?: Record<string, any>;
  workingHours?: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
  theme?: Record<string, any>;
}
