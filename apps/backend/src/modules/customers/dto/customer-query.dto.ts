// apps/backend/src/modules/customers/dto/customer-query.dto.ts
export class CustomerQueryDto {
  page?: number = 1;
  limit?: number = 20;
  search?: string;
}
