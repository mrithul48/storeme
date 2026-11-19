// apps/backend/src/modules/stores/dto/update-store.dto.ts
export class UpdateStoreDto {
  name?: string;
  company?: Record<string, any>;
  settings?: Record<string, any>;
}
