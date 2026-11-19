// apps/backend/src/modules/inventory/repositories/inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  InventoryProductItem,
  InventoryVariantItem,
} from '../interfaces/inventory-entities.interface';

@Injectable()
export class InventoryRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    storeId: string,
    options: {
      search?: string;
      lowStockOnly?: boolean;
      threshold: number;
      skip: number;
      limit: number;
    },
  ): Promise<{ products: InventoryProductItem[]; total: number }> {
    const whereClauses: string[] = [`p."storeId" = $1`, `p.status = 'ACTIVE'`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.search) {
      whereClauses.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    if (options.lowStockOnly) {
      whereClauses.push(
        `((p."manageStockQuantity" = true AND p.stock <= $${idx}) OR p."inStock" = false OR EXISTS (
          SELECT 1 FROM "ProductVariant" pv
          WHERE pv."productId" = p.id AND pv."manageQuantity" = true AND pv.stock <= $${idx}
        ))`,
      );
      params.push(options.threshold);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Product" p WHERE ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const products = await this.db.query<{
      id: string;
      name: string;
      sku: string | null;
      stock: number;
      inStock: boolean;
      manageStockQuantity: boolean;
      manageStockAvailability: boolean;
    }>(
      `SELECT p.id, p.name, p.sku, p.stock, p."inStock", p."manageStockQuantity", p."manageStockAvailability"
       FROM "Product" p
       WHERE ${whereStr}
       ORDER BY p.stock ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    if (products.length === 0) return { products: [], total };

    const productIds = products.map((p) => p.id);
    const variants = await this.db.query<InventoryVariantItem & { productId: string }>(
      `SELECT id, "productId", color, stock, "inStock", "manageQuantity", "manageAvailability"
       FROM "ProductVariant"
       WHERE "productId" = ANY($1)
       ORDER BY "sortOrder" ASC`,
      [productIds],
    );

    const varMap = new Map<string, InventoryVariantItem[]>();
    for (const v of variants) {
      const list = varMap.get(v.productId) || [];
      list.push({
        id: v.id,
        color: v.color,
        stock: v.stock,
        inStock: v.inStock,
        manageQuantity: v.manageQuantity,
        manageAvailability: v.manageAvailability,
      });
      varMap.set(v.productId, list);
    }

    const result: InventoryProductItem[] = products.map((p) => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      stock: p.stock,
      inStock: p.inStock,
      manageStockQuantity: p.manageStockQuantity,
      manageStockAvailability: p.manageStockAvailability,
      variants: varMap.get(p.id) || [],
    }));

    return { products: result, total };
  }

  async findByProduct(storeId: string, productId: string) {
    const product = await this.db.queryOne<{
      id: string;
      name: string;
      sku: string | null;
      stock: number;
      inStock: boolean;
      manageStockQuantity: boolean;
      manageStockAvailability: boolean;
    }>(
      `SELECT id, name, sku, stock, "inStock", "manageStockQuantity", "manageStockAvailability"
       FROM "Product"
       WHERE id = $1 AND "storeId" = $2 LIMIT 1`,
      [productId, storeId],
    );

    if (!product) return null;

    const variants = await this.db.query<InventoryVariantItem>(
      `SELECT id, color, stock, "inStock", "manageQuantity", "manageAvailability"
       FROM "ProductVariant"
       WHERE "productId" = $1
       ORDER BY "sortOrder" ASC`,
      [productId],
    );

    return {
      ...product,
      variants,
    };
  }

  async findProductForAdjust(storeId: string, productId: string) {
    return this.db.queryOne<{ id: string; name: string; stock: number; inStock: boolean }>(
      `SELECT id, name, stock, "inStock" FROM "Product" WHERE id = $1 AND "storeId" = $2 LIMIT 1`,
      [productId, storeId],
    );
  }

  async findVariantForAdjust(productId: string, variantId: string) {
    return this.db.queryOne<{ id: string; color: string; stock: number; inStock: boolean }>(
      `SELECT id, color, stock, "inStock" FROM "ProductVariant" WHERE id = $1 AND "productId" = $2 LIMIT 1`,
      [variantId, productId],
    );
  }

  async incrementVariantStock(client: IDbExecutor, variantId: string, quantity: number): Promise<number> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "ProductVariant"
       SET stock = stock + $1, "inStock" = true, "updatedAt" = NOW()
       WHERE id = $2 RETURNING stock`,
      [quantity, variantId],
    );
    return row!.stock;
  }

  async decrementVariantStock(client: IDbExecutor, variantId: string, quantity: number): Promise<number | null> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "ProductVariant"
       SET stock = stock - $1, "inStock" = (stock - $1 > 0), "updatedAt" = NOW()
       WHERE id = $2 AND stock >= $1 RETURNING stock`,
      [quantity, variantId],
    );
    return row ? row.stock : null;
  }

  async setVariantStock(client: IDbExecutor, variantId: string, quantity: number): Promise<number> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "ProductVariant"
       SET stock = $1, "inStock" = ($1 > 0), "updatedAt" = NOW()
       WHERE id = $2 RETURNING stock`,
      [quantity, variantId],
    );
    return row!.stock;
  }

  async updateProductInStockFromVariants(client: IDbExecutor, productId: string): Promise<void> {
    const anyInStock = await client.queryOne<{ id: string }>(
      `SELECT id FROM "ProductVariant" WHERE "productId" = $1 AND "inStock" = true LIMIT 1`,
      [productId],
    );
    await client.query(
      `UPDATE "Product" SET "inStock" = $1, "updatedAt" = NOW() WHERE id = $2`,
      [Boolean(anyInStock), productId],
    );
  }

  async incrementProductStock(client: IDbExecutor, productId: string, quantity: number): Promise<number> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "Product"
       SET stock = stock + $1, "inStock" = true, "updatedAt" = NOW()
       WHERE id = $2 RETURNING stock`,
      [quantity, productId],
    );
    return row!.stock;
  }

  async decrementProductStock(client: IDbExecutor, productId: string, quantity: number): Promise<number | null> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "Product"
       SET stock = stock - $1, "inStock" = (stock - $1 > 0), "updatedAt" = NOW()
       WHERE id = $2 AND stock >= $1 RETURNING stock`,
      [quantity, productId],
    );
    return row ? row.stock : null;
  }

  async setProductStock(client: IDbExecutor, productId: string, quantity: number): Promise<number> {
    const row = await client.queryOne<{ stock: number }>(
      `UPDATE "Product"
       SET stock = $1, "inStock" = ($1 > 0), "updatedAt" = NOW()
       WHERE id = $2 RETURNING stock`,
      [quantity, productId],
    );
    return row!.stock;
  }
}

