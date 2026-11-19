// apps/backend/src/modules/admin/dto/admin-query.dto.ts

export class AdminQueryDto {
  page?: number = 1;
  limit?: number = 20;
  search?: string;
  status?: string;
  sortBy?: string = 'createdAt';
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateMerchantStatusDto {
  status: 'ACTIVE' | 'SUSPENDED';
  reason?: string;
}
