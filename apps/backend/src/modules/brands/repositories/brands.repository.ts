// apps/backend/src/modules/brands/repositories/brands.repository.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  BrandEntity,
  BrandWithCount,
  BrandDetail,
  BrandDetailProduct,
} from '../interfaces/brand-entities.interface';

@Injectable()
export class BrandsRepository {
  constructor(private readonly db: DatabaseService) {}

  async checkSlugExists(storeId: string, slug: string, excludeId?: string): Promise<boolean> {
    let sql = `SELECT 1 FROM "Brand" WHERE "storeId" = $1 AND slug = $2`;
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
  ): Promise<{ brands: BrandWithCount[]; total: number }> {
    const whereClauses: string[] = [`b."storeId" = $1`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.status) {
      whereClauses.push(`b.status = $${idx++}`);
      params.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(b.name ILIKE $${idx} OR b.slug ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*)::text as count FROM "Brand" b WHERE ${whereStr}`;
    const countRow = await this.db.queryOne<{ count: string }>(countSql, params);
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const dataSql = `
      SELECT b.*,
             COALESCE(p.prod_count, 0)::int as product_count
      FROM "Brand" b
      LEFT JOIN (
        SELECT "brandId", COUNT(*)::int as prod_count
        FROM "Product"
        GROUP BY "brandId"
      ) p ON p."brandId" = b.id
      WHERE ${whereStr}
      ORDER BY b.name ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    interface Row extends BrandEntity {
      product_count: number;
    }

    const rows = await this.db.query<Row>(dataSql, [...params, options.limit, options.skip]);

    const brands: BrandWithCount[] = rows.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl,
      logoPublicId: r.logoPublicId,
      status: r.status,
      productCount: r.product_count,
      _count: { products: r.product_count },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return { brands, total };
  }

  async findOne(storeId: string, idOrSlug: string): Promise<BrandDetail | null> {
    interface Row extends BrandEntity {
      product_count: number;
    }

    const row = await this.db.queryOne<Row>(
      `SELECT b.*,
              COALESCE(p.prod_count, 0)::int as product_count
       FROM "Brand" b
       LEFT JOIN (
         SELECT "brandId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "brandId"
       ) p ON p."brandId" = b.id
       WHERE b."storeId" = $1 AND (b.id = $2 OR b.slug = $2)
       LIMIT 1`,
      [storeId, idOrSlug],
    );

    if (!row) return null;

    const products = await this.db.query<BrandDetailProduct>(
      `SELECT id, name, slug, price, stock, status
       FROM "Product"
       WHERE "brandId" = $1 AND "storeId" = $2
       LIMIT 10`,
      [row.id, storeId],
    );

    return {
      id: row.id,
      storeId: row.storeId,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      logoPublicId: row.logoPublicId,
      status: row.status,
      productCount: row.product_count,
      _count: { products: row.product_count },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      products,
    };
  }

  async findById(storeId: string, id: string): Promise<BrandWithCount | null> {
    interface Row extends BrandEntity {
      product_count: number;
    }

    const row = await this.db.queryOne<Row>(
      `SELECT b.*,
              COALESCE(p.prod_count, 0)::int as product_count
       FROM "Brand" b
       LEFT JOIN (
         SELECT "brandId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "brandId"
       ) p ON p."brandId" = b.id
       WHERE b."storeId" = $1 AND b.id = $2
       LIMIT 1`,
      [storeId, id],
    );

    if (!row) return null;

    return {
      id: row.id,
      storeId: row.storeId,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      logoPublicId: row.logoPublicId,
      status: row.status,
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
    logoUrl: string | null;
    logoPublicId: string | null;
    status: 'ACTIVE' | 'ARCHIVED';
  }): Promise<BrandWithCount> {
    const id = crypto.randomUUID();
    const created = await this.db.queryOne<BrandEntity>(
      `INSERT INTO "Brand" (id, "storeId", name, slug, "logoUrl", "logoPublicId", status, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        id,
        data.storeId,
        data.name,
        data.slug,
        data.logoUrl,
        data.logoPublicId,
        data.status,
      ],
    );

    return {
      ...created!,
      productCount: 0,
      _count: { products: 0 },
    };
  }

  async update(id: string, data: Partial<BrandEntity>): Promise<BrandWithCount> {
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
    if (data.logoUrl !== undefined) {
      fields.push(`"logoUrl" = $${idx++}`);
      values.push(data.logoUrl);
    }
    if (data.logoPublicId !== undefined) {
      fields.push(`"logoPublicId" = $${idx++}`);
      values.push(data.logoPublicId);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);

    await this.db.query(
      `UPDATE "Brand" SET ${fields.join(', ')} WHERE id = $${idx}`,
      values,
    );

    const updated = await this.db.queryOne<BrandEntity & { product_count: number }>(
      `SELECT b.*, COALESCE(p.prod_count, 0)::int as product_count
       FROM "Brand" b
       LEFT JOIN (
         SELECT "brandId", COUNT(*)::int as prod_count
         FROM "Product"
         GROUP BY "brandId"
       ) p ON p."brandId" = b.id
       WHERE b.id = $1`,
      [id],
    );

    return {
      ...updated!,
      productCount: updated!.product_count,
      _count: { products: updated!.product_count },
    };
  }

  async disassociateProducts(client: IDbExecutor, brandId: string, storeId: string): Promise<void> {
    await client.query(
      `UPDATE "Product" SET "brandId" = NULL, "updatedAt" = NOW()
       WHERE "brandId" = $1 AND "storeId" = $2`,
      [brandId, storeId],
    );
  }

  async delete(client: IDbExecutor, id: string): Promise<void> {
    await client.query(`DELETE FROM "Brand" WHERE id = $1`, [id]);
  }
}

