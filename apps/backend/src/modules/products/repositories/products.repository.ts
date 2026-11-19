// apps/backend/src/modules/products/repositories/products.repository.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  ProductEntity,
  ProductImageEntity,
  ProductVariantEntity,
  ProductVariantImageEntity,
} from '../interfaces/product-entities.interface';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: DatabaseService) {}

  async checkSlugExists(storeId: string, slug: string, excludeId?: string): Promise<boolean> {
    let sql = `SELECT 1 FROM "Product" WHERE "storeId" = $1 AND slug = $2`;
    const params: unknown[] = [storeId, slug];
    if (excludeId) {
      sql += ` AND id != $3`;
      params.push(excludeId);
    }
    sql += ` LIMIT 1`;
    const row = await this.db.queryOne<{ '?column?': number }>(sql, params);
    return Boolean(row);
  }

  async findStoreSettings(
    storeId: string,
  ): Promise<{ stockManagementType: string | null; colorWiseStockType: string | null } | null> {
    return this.db.queryOne<{ stockManagementType: string | null; colorWiseStockType: string | null }>(
      `SELECT "stockManagementType", "colorWiseStockType" FROM "StoreSettings" WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async findAll(
    storeId: string,
    options: {
      status?: string;
      categoryId?: string;
      brandId?: string;
      featured?: boolean;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      skip: number;
      limit: number;
    },
  ): Promise<{ products: ProductEntity[]; total: number }> {
    const whereClauses: string[] = [`p."storeId" = $1`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.status) {
      whereClauses.push(`p.status = $${idx++}`);
      params.push(options.status);
    }
    if (options.categoryId) {
      whereClauses.push(`p."categoryId" = $${idx++}`);
      params.push(options.categoryId);
    }
    if (options.brandId) {
      whereClauses.push(`p."brandId" = $${idx++}`);
      params.push(options.brandId);
    }
    if (options.featured !== undefined) {
      whereClauses.push(`p.featured = $${idx++}`);
      params.push(options.featured);
    }
    if (options.search) {
      whereClauses.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Product" p WHERE ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const allowedSort = ['name', 'price', 'stock', 'createdAt', 'updatedAt'];
    const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortDir = options.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const products = await this.db.query<ProductEntity>(
      `SELECT p.*
       FROM "Product" p
       WHERE ${whereStr}
       ORDER BY p."${sortBy}" ${sortDir}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    if (products.length === 0) {
      return { products: [], total };
    }

    const populated = await this.populateBatchRelations(products);
    return { products: populated, total };
  }

  async findOne(storeId: string, idOrSlug: string): Promise<ProductEntity | null> {
    const product = await this.db.queryOne<ProductEntity>(
      `SELECT * FROM "Product"
       WHERE "storeId" = $1 AND (id = $2 OR slug = $2)
       LIMIT 1`,
      [storeId, idOrSlug],
    );

    if (!product) return null;

    const [populated] = await this.populateBatchRelations([product]);
    return populated;
  }

  async findById(storeId: string, id: string): Promise<ProductEntity | null> {
    const product = await this.db.queryOne<ProductEntity>(
      `SELECT * FROM "Product" WHERE "storeId" = $1 AND id = $2 LIMIT 1`,
      [storeId, id],
    );

    if (!product) return null;

    const [populated] = await this.populateBatchRelations([product]);
    return populated;
  }

  private async populateBatchRelations(products: ProductEntity[]): Promise<ProductEntity[]> {
    if (products.length === 0) return [];
    const productIds = products.map((p) => p.id);

    // Fetch images
    const images = await this.db.query<ProductImageEntity>(
      `SELECT id, "productId", url, "publicId", "altText", "sortOrder"
       FROM "ProductImage"
       WHERE "productId" = ANY($1)
       ORDER BY "sortOrder" ASC`,
      [productIds],
    );

    // Fetch variants
    const variants = await this.db.query<ProductVariantEntity>(
      `SELECT id, "productId", color, "manageAvailability", "inStock", "manageQuantity", stock, "sortOrder"
       FROM "ProductVariant"
       WHERE "productId" = ANY($1)
       ORDER BY "sortOrder" ASC`,
      [productIds],
    );

    const variantIds = variants.map((v) => v.id);
    const variantImages = variantIds.length > 0
      ? await this.db.query<ProductVariantImageEntity>(
          `SELECT id, "variantId", url, "publicId", "altText", "sortOrder"
           FROM "ProductVariantImage"
           WHERE "variantId" = ANY($1)
           ORDER BY "sortOrder" ASC`,
          [variantIds],
        )
      : [];

    // Group variant images by variantId
    const vImgMap = new Map<string, ProductVariantImageEntity[]>();
    for (const vImg of variantImages) {
      const list = vImgMap.get(vImg.variantId) || [];
      list.push(vImg);
      vImgMap.set(vImg.variantId, list);
    }

    // Attach variant images to variants
    for (const variant of variants) {
      variant.images = vImgMap.get(variant.id) || [];
    }

    // Group images and variants by productId
    const imgMap = new Map<string, ProductImageEntity[]>();
    for (const img of images) {
      const list = imgMap.get(img.productId) || [];
      list.push(img);
      imgMap.set(img.productId, list);
    }

    const varMap = new Map<string, ProductVariantEntity[]>();
    for (const v of variants) {
      const list = varMap.get(v.productId) || [];
      list.push(v);
      varMap.set(v.productId, list);
    }

    // Category and Brand lookups
    const categoryIds = Array.from(new Set(products.map((p) => p.categoryId).filter(Boolean))) as string[];
    const brandIds = Array.from(new Set(products.map((p) => p.brandId).filter(Boolean))) as string[];

    const categories = categoryIds.length > 0
      ? await this.db.query<{ id: string; name: string; slug: string }>(
          `SELECT id, name, slug FROM "Category" WHERE id = ANY($1)`,
          [categoryIds],
        )
      : [];
    const catMap = new Map<string, { id: string; name: string; slug: string }>();
    for (const c of categories) catMap.set(c.id, c);

    const brands = brandIds.length > 0
      ? await this.db.query<{ id: string; name: string; slug: string }>(
          `SELECT id, name, slug FROM "Brand" WHERE id = ANY($1)`,
          [brandIds],
        )
      : [];
    const brandMap = new Map<string, { id: string; name: string; slug: string }>();
    for (const b of brands) brandMap.set(b.id, b);

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
      weight: p.weight !== null ? Number(p.weight) : null,
      images: imgMap.get(p.id) || [],
      variants: varMap.get(p.id) || [],
      category: p.categoryId ? catMap.get(p.categoryId) || null : null,
      brand: p.brandId ? brandMap.get(p.brandId) || null : null,
    }));
  }

  async createProduct(
    client: IDbExecutor,
    data: {
      id: string;
      storeId: string;
      name: string;
      slug: string;
      description?: string | null;
      price: number;
      salePrice?: number | null;
      sku?: string | null;
      weight?: number | null;
      stock: number;
      manageStockQuantity: boolean;
      manageStockAvailability: boolean;
      inStock: boolean;
      status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
      featured: boolean;
      categoryId?: string | null;
      brandId?: string | null;
    },
  ): Promise<ProductEntity> {
    return (await client.queryOne<ProductEntity>(
      `INSERT INTO "Product" (
        id, "storeId", name, slug, description, price, "salePrice", sku, weight,
        stock, "manageStockQuantity", "manageStockAvailability", "inStock", status,
        featured, "categoryId", "brandId", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
      ) RETURNING *`,
      [
        data.id,
        data.storeId,
        data.name,
        data.slug,
        data.description ?? null,
        data.price,
        data.salePrice ?? null,
        data.sku ?? null,
        data.weight ?? null,
        data.stock,
        data.manageStockQuantity,
        data.manageStockAvailability,
        data.inStock,
        data.status,
        data.featured,
        data.categoryId ?? null,
        data.brandId ?? null,
      ],
    ))!;
  }

  async createProductImage(
    client: IDbExecutor,
    data: { id: string; productId: string; url: string; publicId: string; altText: string | null; sortOrder: number },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "ProductImage" (id, "productId", url, "publicId", "altText", "sortOrder")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, data.productId, data.url, data.publicId, data.altText, data.sortOrder],
    );
  }

  async createProductVariant(
    client: IDbExecutor,
    data: {
      id: string;
      productId: string;
      color: string;
      manageAvailability: boolean;
      inStock: boolean;
      manageQuantity: boolean;
      stock: number;
      sortOrder: number;
    },
  ): Promise<string> {
    const row = await client.queryOne<{ id: string }>(
      `INSERT INTO "ProductVariant" (
        id, "productId", color, "manageAvailability", "inStock", "manageQuantity", stock, "sortOrder", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW()
      ) RETURNING id`,
      [
        data.id,
        data.productId,
        data.color,
        data.manageAvailability,
        data.inStock,
        data.manageQuantity,
        data.stock,
        data.sortOrder,
      ],
    );
    return row!.id;
  }

  async createProductVariantImage(
    client: IDbExecutor,
    data: { id: string; variantId: string; url: string; publicId: string; altText: string | null; sortOrder: number },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "ProductVariantImage" (id, "variantId", url, "publicId", "altText", "sortOrder")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, data.variantId, data.url, data.publicId, data.altText, data.sortOrder],
    );
  }

  async deleteProductImages(client: IDbExecutor, productId: string): Promise<void> {
    await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [productId]);
  }

  async deleteProductVariants(client: IDbExecutor, productId: string): Promise<void> {
    // Foreign key with ON DELETE CASCADE deletes ProductVariantImage automatically,
    // but deleting explicitly ensures full safety.
    await client.query(
      `DELETE FROM "ProductVariantImage" WHERE "variantId" IN (
        SELECT id FROM "ProductVariant" WHERE "productId" = $1
      )`,
      [productId],
    );
    await client.query(`DELETE FROM "ProductVariant" WHERE "productId" = $1`, [productId]);
  }

  async updateProduct(
    client: IDbExecutor,
    id: string,
    data: Partial<ProductEntity>,
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const columnMap: Record<string, string> = {
      name: 'name',
      slug: 'slug',
      description: 'description',
      price: 'price',
      salePrice: '"salePrice"',
      sku: 'sku',
      weight: 'weight',
      stock: 'stock',
      manageStockQuantity: '"manageStockQuantity"',
      manageStockAvailability: '"manageStockAvailability"',
      inStock: '"inStock"',
      status: 'status',
      featured: 'featured',
      categoryId: '"categoryId"',
      brandId: '"brandId"',
    };

    for (const [prop, col] of Object.entries(columnMap)) {
      if ((data as Record<string, unknown>)[prop] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push((data as Record<string, unknown>)[prop]);
      }
    }

    if (fields.length === 0) return;

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);

    await client.query(
      `UPDATE "Product" SET ${fields.join(', ')} WHERE id = $${idx}`,
      values,
    );
  }

  async deleteProduct(storeId: string, id: string): Promise<void> {
    await this.db.query(
      `DELETE FROM "Product" WHERE id = $1 AND "storeId" = $2`,
      [id, storeId],
    );
  }
}

