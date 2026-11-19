// apps/backend/src/modules/inventory/interfaces/inventory-entities.interface.ts

export interface InventoryVariantItem {
  id: string;
  color: string;
  stock: number;
  inStock: boolean;
  manageQuantity: boolean;
  manageAvailability: boolean;
}

export interface InventoryProductItem {
  productId: string;
  productName: string;
  sku: string | null;
  stock: number;
  inStock: boolean;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  variants: InventoryVariantItem[];
}

