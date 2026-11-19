// apps/backend/src/modules/categories/repositories/categories.repository.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  CategoryEntity,
  CategoryWithCount,
  CategoryDetail,
  CategoryDetailProduct,
} from '../interfaces/category-entities.interface';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: DatabaseService) {}

  async checkSlugExists(storeId: string, slug: string, excludeId?: string): Promise<boolean> {
    let sql = `SELECT 1 FROM "Category" WHERE "storeId" = $1 AND slug = $2`;
    const params: unknown[] = [storeId, slug];
    if (excludeId) {
      sql += ` AND id != $3`;
      params.push(excludeId);
    }
    sql += ` LIMIT 1`;
    const row = await this.db.queryOne<{ '?column?': number }>(sql, params);
    return Boolean(row);
  }

  async findAll(
    storeId: string,
    options: { status?: string; search?: string; skip: number; limit: number },
  ): Promise<{ categories: CategoryWithCount[]; total: number }> {
    const whereClauses: string[] = [`c."storeId" = $1`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.status) {
      whereClauses.push(`c.status = $${idx++}`);
      params.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(c.name ILIKE $${idx} OR c.description ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*)::text as count FROM "Category" c WHERE ${whereStr}`;
    const countRow = await this.db.queryOne<{ count: string }>(countSql, params);
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const dataSql = `
      SELECT c.*,
             COALESCE(p.prod_count, 0)::int as product_count
      FROM "Category" c
      LEFT JOIN (
        SELECT "categoryId", COUNT(*)::int as prod_count
        FROM "Product"
        GROUP BY "categoryId"
      ) p ON p."categoryId" = c.id
      WHERE ${whereStr}
      ORDER BY c."sortOrder" ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    interface Row extends CategoryEntity {
      product_count: number;
    }

    const rows = await this.db.query<Row>(dataSql, [...params, options.limit, options.skip]);

    const categories: CategoryWithCount[] = rows.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      name: r.name,
      slug: r.slug,
      description: r.description,
      imageUrl: r.imageUrl,
      imagePublicId: r.imagePublicId,
      status: r.status,
      sortOrder: r.sortOrder,
      productCount: r.product_count,
      _count: { products: r.product_count },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return { categories, total };
  }

  async findOne(storeId: string, idOrSlug: string): Promise<CategoryDetail | null> {
    interface Row extends CategoryEntity {
      product_count: number;
    }

    const row = await this.db.queryOne<Row>(
      `SELECT c.*,
              COALESCE(p.prod_count, 0)::int as product_count
       FROM "Category" c
       LEFT JOIN (
         SELECT "categoryId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "categoryId"
       ) p ON p."categoryId" = c.id
       WHERE c."storeId" = $1 AND (c.id = $2 OR c.slug = $2)
       LIMIT 1`,
      [storeId, idOrSlug],
    );

    if (!row) return null;

    const products = await this.db.query<CategoryDetailProduct>(
      `SELECT id, name, slug, price, stock, status
       FROM "Product"
       WHERE "categoryId" = $1 AND "storeId" = $2
       LIMIT 10`,
      [row.id, storeId],
    );

    return {
      id: row.id,
      storeId: row.storeId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      status: row.status,
      sortOrder: row.sortOrder,
      productCount: row.product_count,
      _count: { products: row.product_count },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      products,
    };
  }

  async findById(storeId: string, id: string): Promise<CategoryWithCount | null> {
    interface Row extends CategoryEntity {
      product_count: number;
    }

    const row = await this.db.queryOne<Row>(
      `SELECT c.*,
              COALESCE(p.prod_count, 0)::int as product_count
       FROM "Category" c
       LEFT JOIN (
         SELECT "categoryId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "categoryId"
       ) p ON p."categoryId" = c.id
       WHERE c."storeId" = $1 AND c.id = $2
       LIMIT 1`,
      [storeId, id],
    );

    if (!row) return null;

    return {
      id: row.id,
      storeId: row.storeId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      status: row.status,
      sortOrder: row.sortOrder,
      productCount: row.product_count,
      _count: { products: row.product_count },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async create(data: {
    storeId: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imagePublicId: string | null;
    status: 'ACTIVE' | 'ARCHIVED';
    sortOrder: number;
  }): Promise<CategoryWithCount> {
    const id = crypto.randomUUID();
    const created = await this.db.queryOne<CategoryEntity>(
      `INSERT INTO "Category" (id, "storeId", name, slug, description, "imageUrl", "imagePublicId", status, "sortOrder", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        id,
        data.storeId,
        data.name,
        data.slug,
        data.description,
        data.imageUrl,
        data.imagePublicId,
        data.status,
        data.sortOrder,
      ],
    );

    return {
      ...created!,
      productCount: 0,
      _count: { products: 0 },
    };
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<CategoryWithCount> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.imageUrl !== undefined) {
      fields.push(`"imageUrl" = $${idx++}`);
      values.push(data.imageUrl);
    }
    if (data.imagePublicId !== undefined) {
      fields.push(`"imagePublicId" = $${idx++}`);
      values.push(data.imagePublicId);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.sortOrder !== undefined) {
      fields.push(`"sortOrder" = $${idx++}`);
      values.push(data.sortOrder);
    }

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);

    await this.db.query(
      `UPDATE "Category" SET ${fields.join(', ')} WHERE id = $${idx}`,
      values,
    );

    const updated = await this.db.queryOne<CategoryEntity & { product_count: number }>(
      `SELECT c.*, COALESCE(p.prod_count, 0)::int as product_count
       FROM "Category" c
       LEFT JOIN (
         SELECT "categoryId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "categoryId"
       ) p ON p."categoryId" = c.id
       WHERE c.id = $1`,
      [id],
    );

    return {
      ...updated!,
      productCount: updated!.product_count,
      _count: { products: updated!.product_count },
    };
  }

  async disassociateProducts(client: IDbExecutor, categoryId: string, storeId: string): Promise<void> {
    await client.query(
      `UPDATE "Product" SET "categoryId" = NULL, "updatedAt" = NOW()
       WHERE "categoryId" = $1 AND "storeId" = $2`,
      [categoryId, storeId],
    );
  }

  async delete(client: IDbExecutor, id: string): Promise<void> {
    await client.query(`DELETE FROM "Category" WHERE id = $1`, [id]);
  }
}

