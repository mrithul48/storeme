// apps/api/src/modules/inventory/dto/query-inventory.dto.ts
export class QueryInventoryDto {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean | string;
  threshold?: number;
}

