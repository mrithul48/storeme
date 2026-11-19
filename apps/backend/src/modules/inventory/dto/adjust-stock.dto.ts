// apps/api/src/modules/inventory/dto/adjust-stock.dto.ts
export class AdjustStockDto {
  productId!: string;
  variantId?: string;
  operation!: 'INCREMENT' | 'DECREMENT' | 'SET';
  quantity!: number;
  reason?: string;
}
