// apps/backend/src/modules/stores/repositories/stores.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  StoreEntity,
  CompanyDetailsEntity,
  StoreSettingsEntity,
  ThemeSettingsEntity,
  WorkingHoursEntity,
  HomePageEntity,
  StoreWithDetails,
  StorefrontConfig,
} from '../interfaces/store-entities.interface';

@Injectable()
export class StoresRepository {
  constructor(private readonly db: DatabaseService) {}

  async findStoreById(storeId: string): Promise<StoreWithDetails | null> {
    const store = await this.db.queryOne<StoreEntity>(
      `SELECT id, slug, name, status, "ownerId", "customDomain", "domainStatus", "createdAt", "updatedAt"
       FROM "Store" WHERE id = $1`,
      [storeId],
    );
    if (!store) return null;
    return this.populateStoreDetails(store);
  }

  async findStoreByOwnerId(ownerId: string): Promise<StoreWithDetails | null> {
    const store = await this.db.queryOne<StoreEntity>(
      `SELECT id, slug, name, status, "ownerId", "customDomain", "domainStatus", "createdAt", "updatedAt"
       FROM "Store" WHERE "ownerId" = $1 LIMIT 1`,
      [ownerId],
    );
    if (!store) return null;
    return this.populateStoreDetails(store);
  }

  async findUserByGoogleId(googleId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "User" WHERE "googleId" = $1 LIMIT 1`,
      [googleId],
    );
  }

  async findUserByEmail(email: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email],
    );
  }

  async countStoresByOwnerId(ownerId: string): Promise<number> {
    const res = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Store" WHERE "ownerId" = $1`,
      [ownerId],
    );
    return res ? parseInt(res.count, 10) : 0;
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await this.db.query<{ slug: string }>(`SELECT slug FROM "Store"`);
    return rows.map((r) => r.slug);
  }

  async findCheapestActivePlan(): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "Plan" WHERE status = 'ACTIVE' ORDER BY price ASC LIMIT 1`,
    );
  }

  private async populateStoreDetails(store: StoreEntity): Promise<StoreWithDetails> {
    const [company, settings, theme, workingHours, subscription] = await Promise.all([
      this.db.queryOne<CompanyDetailsEntity>(
        `SELECT * FROM "CompanyDetails" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.queryOne<StoreSettingsEntity>(
        `SELECT * FROM "StoreSettings" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.queryOne<ThemeSettingsEntity>(
        `SELECT * FROM "ThemeSettings" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.query<WorkingHoursEntity>(
        `SELECT * FROM "WorkingHours" WHERE "storeId" = $1 ORDER BY "dayOfWeek" ASC`,
        [store.id],
      ),
      this.findStoreSubscription(store.id),
    ]);

    return {
      ...store,
      company,
      settings,
      theme,
      workingHours,
      subscription,
    };
  }

  private async findStoreSubscription(storeId: string) {
    interface SubRow {
      id: string;
      storeId: string;
      planId: string;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      plan_name: string;
      plan_price: number;
      plan_features: Record<string, unknown> | null;
    }

    const sub = await this.db.queryOne<SubRow>(
      `SELECT s.id, s."storeId", s."planId", s.status, s."currentPeriodStart", s."currentPeriodEnd",
              p.name as plan_name, p.price as plan_price, p.features as plan_features
       FROM "Subscription" s
       LEFT JOIN "Plan" p ON s."planId" = p.id
       WHERE s."storeId" = $1
       ORDER BY s."createdAt" DESC
       LIMIT 1`,
      [storeId],
    );

    if (!sub) return null;

    return {
      id: sub.id,
      storeId: sub.storeId,
      planId: sub.planId,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      plan: sub.plan_name
        ? {
            id: sub.planId,
            name: sub.plan_name,
            price: Number(sub.plan_price),
            durationDays: 30,
            features: sub.plan_features,
          }
        : null,
    };
  }

  async createStore(
    client: IDbExecutor,
    data: { id: string; slug: string; name: string; ownerId: string; status: 'ACTIVE' },
  ): Promise<StoreEntity> {
    return (await client.queryOne<StoreEntity>(
      `INSERT INTO "Store" (id, slug, name, "ownerId", status, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [data.id, data.slug, data.name, data.ownerId, data.status],
    ))!;
  }

  async createCompanyDetails(
    client: IDbExecutor,
    data: {
      id: string;
      storeId: string;
      businessType: string;
      address: string | null;
      email: string | null;
      phone: string | null;
      whatsapp: string | null;
      description: string | null;
      logoUrl: string | null;
      logoPublicId: string | null;
      socialLinks: Record<string, unknown> | null;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "CompanyDetails"
       (id, "storeId", "businessType", address, email, phone, whatsapp, description, "logoUrl", "logoPublicId", "socialLinks", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        data.id,
        data.storeId,
        data.businessType,
        data.address,
        data.email,
        data.phone,
        data.whatsapp,
        data.description,
        data.logoUrl,
        data.logoPublicId,
        data.socialLinks ? JSON.stringify(data.socialLinks) : null,
      ],
    );
  }

  async createStoreSettings(
    client: IDbExecutor,
    data: { id: string; storeId: string; brandsEnabled: boolean; ordersEnabled: boolean },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "StoreSettings" (id, "storeId", "brandsEnabled", "ordersEnabled", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [data.id, data.storeId, data.brandsEnabled, data.ordersEnabled],
    );
  }

  async createThemeSettings(
    client: IDbExecutor,
    data: {
      id: string;
      storeId: string;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      surfaceColor: string;
      textColor: string;
      mutedTextColor: string;
      navbarBg: string;
      navbarText: string;
      buttonShape: 'SQUARE' | 'ROUNDED' | 'MEDIUM_ROUNDED' | 'PILL';
      primaryFont: string;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "ThemeSettings"
       (id, "storeId", "primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor", "mutedTextColor", "navbarBg", "navbarText", "buttonShape", "primaryFont", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
      [
        data.id,
        data.storeId,
        data.primaryColor,
        data.secondaryColor,
        data.accentColor,
        data.backgroundColor,
        data.surfaceColor,
        data.textColor,
        data.mutedTextColor,
        data.navbarBg,
        data.navbarText,
        data.buttonShape,
        data.primaryFont,
      ],
    );
  }

  async createWorkingHoursBatch(
    client: IDbExecutor,
    items: Array<{
      id: string;
      storeId: string;
      dayOfWeek: number;
      isOpen: boolean;
      openTime: string | null;
      closeTime: string | null;
    }>,
  ): Promise<void> {
    for (const item of items) {
      await client.query(
        `INSERT INTO "WorkingHours" (id, "storeId", "dayOfWeek", "isOpen", "openTime", "closeTime")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.id, item.storeId, item.dayOfWeek, item.isOpen, item.openTime, item.closeTime],
      );
    }
  }

  async createHomePage(
    client: IDbExecutor,
    data: { id: string; storeId: string; heroType: 'SLIDER'; heroEnabled: boolean; aboutEnabled: boolean },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "HomePage" (id, "storeId", "heroType", "heroEnabled", "aboutEnabled", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [data.id, data.storeId, data.heroType, data.heroEnabled, data.aboutEnabled],
    );
  }

  async createSubscription(
    client: IDbExecutor,
    data: {
      id: string;
      storeId: string;
      planId: string;
      status: 'ACTIVE';
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "Subscription" (id, "storeId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [data.id, data.storeId, data.planId, data.status, data.currentPeriodStart, data.currentPeriodEnd],
    );
  }

  async updateStoreName(client: IDbExecutor, storeId: string, name: string): Promise<void> {
    await client.query(
      `UPDATE "Store" SET name = $1, "updatedAt" = NOW() WHERE id = $2`,
      [name, storeId],
    );
  }

  async updateCompanyDetails(
    client: IDbExecutor,
    storeId: string,
    data: Partial<CompanyDetailsEntity>,
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.businessType !== undefined) {
      fields.push(`"businessType" = $${idx++}`);
      values.push(data.businessType);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(data.address);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.whatsapp !== undefined) {
      fields.push(`whatsapp = $${idx++}`);
      values.push(data.whatsapp);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.logoUrl !== undefined) {
      fields.push(`"logoUrl" = $${idx++}`);
      values.push(data.logoUrl);
    }
    if (data.logoPublicId !== undefined) {
      fields.push(`"logoPublicId" = $${idx++}`);
      values.push(data.logoPublicId);
    }
    if (data.socialLinks !== undefined) {
      fields.push(`"socialLinks" = $${idx++}`);
      values.push(data.socialLinks ? JSON.stringify(data.socialLinks) : null);
    }

    if (fields.length === 0) return;

    fields.push(`"updatedAt" = NOW()`);
    values.push(storeId);

    await client.query(
      `UPDATE "CompanyDetails" SET ${fields.join(', ')} WHERE "storeId" = $${idx}`,
      values,
    );
  }

  async findStoreSettings(client: IDbExecutor, storeId: string): Promise<StoreSettingsEntity | null> {
    return client.queryOne<StoreSettingsEntity>(
      `SELECT * FROM "StoreSettings" WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async upsertStoreSettings(
    client: IDbExecutor,
    storeId: string,
    data: Partial<StoreSettingsEntity>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO "StoreSettings" (
        id, "storeId", "brandsEnabled", "ordersEnabled", "codEnabled", "onlinePaymentEnabled",
        "whatsappOrderEnabled", "stockManagementType", "colorWiseStockType", "shippingType",
        "shippingFixedCharge", "shippingMinOrderAmount", "shippingFallbackCharge",
        "shippingDefaultWeight", "shippingWeightRates", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
      )
      ON CONFLICT ("storeId") DO UPDATE SET
        "brandsEnabled" = COALESCE($2, "StoreSettings"."brandsEnabled"),
        "ordersEnabled" = COALESCE($3, "StoreSettings"."ordersEnabled"),
        "codEnabled" = COALESCE($4, "StoreSettings"."codEnabled"),
        "onlinePaymentEnabled" = COALESCE($5, "StoreSettings"."onlinePaymentEnabled"),
        "whatsappOrderEnabled" = COALESCE($6, "StoreSettings"."whatsappOrderEnabled"),
        "stockManagementType" = COALESCE($7, "StoreSettings"."stockManagementType"),
        "colorWiseStockType" = COALESCE($8, "StoreSettings"."colorWiseStockType"),
        "shippingType" = COALESCE($9, "StoreSettings"."shippingType"),
        "shippingFixedCharge" = COALESCE($10, "StoreSettings"."shippingFixedCharge"),
        "shippingMinOrderAmount" = COALESCE($11, "StoreSettings"."shippingMinOrderAmount"),
        "shippingFallbackCharge" = COALESCE($12, "StoreSettings"."shippingFallbackCharge"),
        "shippingDefaultWeight" = COALESCE($13, "StoreSettings"."shippingDefaultWeight"),
        "shippingWeightRates" = COALESCE($14, "StoreSettings"."shippingWeightRates"),
        "updatedAt" = NOW()`,
      [
        storeId,
        data.brandsEnabled ?? null,
        data.ordersEnabled ?? null,
        data.codEnabled ?? null,
        data.onlinePaymentEnabled ?? null,
        data.whatsappOrderEnabled ?? null,
        data.stockManagementType ?? null,
        data.colorWiseStockType ?? null,
        data.shippingType ?? null,
        data.shippingFixedCharge ?? null,
        data.shippingMinOrderAmount ?? null,
        data.shippingFallbackCharge ?? null,
        data.shippingDefaultWeight ?? null,
        data.shippingWeightRates ? JSON.stringify(data.shippingWeightRates) : null,
      ],
    );
  }

  async updateProductsStockMode(
    client: IDbExecutor,
    storeId: string,
    mode: 'AVAILABILITY' | 'QUANTITY' | 'COLOR_WISE',
  ): Promise<void> {
    if (mode === 'AVAILABILITY') {
      await client.query(
        `UPDATE "Product"
         SET "manageStockAvailability" = true, "manageStockQuantity" = false, "inStock" = true, stock = 0, "updatedAt" = NOW()
         WHERE "storeId" = $1`,
        [storeId],
      );
    } else if (mode === 'QUANTITY') {
      await client.query(
        `UPDATE "Product"
         SET "manageStockQuantity" = true, "manageStockAvailability" = false, stock = 0, "inStock" = false, "updatedAt" = NOW()
         WHERE "storeId" = $1`,
        [storeId],
      );
    } else if (mode === 'COLOR_WISE') {
      await client.query(
        `UPDATE "Product"
         SET "manageStockAvailability" = false, "manageStockQuantity" = false, stock = 0, "inStock" = false, "updatedAt" = NOW()
         WHERE "storeId" = $1`,
        [storeId],
      );
    }
  }

  async getTheme(storeId: string): Promise<ThemeSettingsEntity | null> {
    return this.db.queryOne<ThemeSettingsEntity>(
      `SELECT * FROM "ThemeSettings" WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async upsertTheme(storeId: string, data: Partial<ThemeSettingsEntity>): Promise<ThemeSettingsEntity> {
    return (await this.db.queryOne<ThemeSettingsEntity>(
      `INSERT INTO "ThemeSettings" (
        id, "storeId", "primaryColor", "secondaryColor", "accentColor", "backgroundColor",
        "surfaceColor", "textColor", "mutedTextColor", "navbarBg", "navbarText",
        "buttonBg", "buttonText", "h1Color", "h2Color", "paragraphColor",
        "buttonShape", "primaryFont", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1,
        COALESCE($2, '#22c55e'), COALESCE($3, '#f0fdf4'), COALESCE($4, '#16a34a'), COALESCE($5, '#ffffff'),
        COALESCE($6, '#f6faf7'), COALESCE($7, '#111827'), COALESCE($8, '#6b7280'), COALESCE($9, '#ffffff'),
        COALESCE($10, '#111827'), $11, $12, $13, $14, $15,
        COALESCE($16, 'MEDIUM_ROUNDED'), COALESCE($17, 'Inter'), NOW()
      )
      ON CONFLICT ("storeId") DO UPDATE SET
        "primaryColor" = COALESCE($2, "ThemeSettings"."primaryColor"),
        "secondaryColor" = COALESCE($3, "ThemeSettings"."secondaryColor"),
        "accentColor" = COALESCE($4, "ThemeSettings"."accentColor"),
        "backgroundColor" = COALESCE($5, "ThemeSettings"."backgroundColor"),
        "surfaceColor" = COALESCE($6, "ThemeSettings"."surfaceColor"),
        "textColor" = COALESCE($7, "ThemeSettings"."textColor"),
        "mutedTextColor" = COALESCE($8, "ThemeSettings"."mutedTextColor"),
        "navbarBg" = COALESCE($9, "ThemeSettings"."navbarBg"),
        "navbarText" = COALESCE($10, "ThemeSettings"."navbarText"),
        "buttonBg" = COALESCE($11, "ThemeSettings"."buttonBg"),
        "buttonText" = COALESCE($12, "ThemeSettings"."buttonText"),
        "h1Color" = COALESCE($13, "ThemeSettings"."h1Color"),
        "h2Color" = COALESCE($14, "ThemeSettings"."h2Color"),
        "paragraphColor" = COALESCE($15, "ThemeSettings"."paragraphColor"),
        "buttonShape" = COALESCE($16, "ThemeSettings"."buttonShape"),
        "primaryFont" = COALESCE($17, "ThemeSettings"."primaryFont"),
        "updatedAt" = NOW()
      RETURNING *`,
      [
        storeId,
        data.primaryColor ?? null,
        data.secondaryColor ?? null,
        data.accentColor ?? null,
        data.backgroundColor ?? null,
        data.surfaceColor ?? null,
        data.textColor ?? null,
        data.mutedTextColor ?? null,
        data.navbarBg ?? null,
        data.navbarText ?? null,
        data.buttonBg ?? null,
        data.buttonText ?? null,
        data.h1Color ?? null,
        data.h2Color ?? null,
        data.paragraphColor ?? null,
        data.buttonShape ?? null,
        data.primaryFont ?? null,
      ],
    ))!;
  }

  async getHomePage(storeId: string): Promise<HomePageEntity | null> {
    return this.db.queryOne<HomePageEntity>(
      `SELECT * FROM "HomePage" WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async upsertHomePage(storeId: string, data: Record<string, unknown>): Promise<HomePageEntity> {
    const existing = await this.getHomePage(storeId);
    if (!existing) {
      // Dynamic INSERT
      const keys = Object.keys(data);
      const cols = ['id', '"storeId"', '"updatedAt"', ...keys.map((k) => `"${k}"`)];
      const placeholders = ['$1', '$2', 'NOW()', ...keys.map((_, i) => `$${i + 3}`)];
      const values: unknown[] = [
        crypto.randomUUID ? crypto.randomUUID() : (await this.db.queryOne<{ id: string }>('SELECT gen_random_uuid() as id'))!.id,
        storeId,
        ...keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k])),
      ];

      return (await this.db.queryOne<HomePageEntity>(
        `INSERT INTO "HomePage" (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values,
      ))!;
    }

    // Dynamic UPDATE
    const keys = Object.keys(data);
    if (keys.length === 0) return existing;

    const setClauses = keys.map((k, i) => `"${k}" = $${i + 2}`);
    setClauses.push('"updatedAt" = NOW()');
    const values: unknown[] = [
      storeId,
      ...keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k])),
    ];

    return (await this.db.queryOne<HomePageEntity>(
      `UPDATE "HomePage" SET ${setClauses.join(', ')} WHERE "storeId" = $1 RETURNING *`,
      values,
    ))!;
  }

  async findCategoryInStore(categoryId: string, storeId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "Category" WHERE id = $1 AND "storeId" = $2 LIMIT 1`,
      [categoryId, storeId],
    );
  }

  async findProductInStore(productId: string, storeId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "Product" WHERE id = $1 AND "storeId" = $2 LIMIT 1`,
      [productId, storeId],
    );
  }

  async getStorefrontConfig(slugOrDomain: string): Promise<StorefrontConfig | null> {
    // 1. Try finding by slug first (case-insensitive)
    let store = await this.db.queryOne<StoreEntity>(
      `SELECT id, slug, name, status, "customDomain", "domainStatus", "createdAt", "updatedAt"
       FROM "Store" WHERE LOWER(slug) = LOWER($1)`,
      [slugOrDomain],
    );

    // 2. Fallback: by verified custom domain
    if (!store) {
      const normalized = slugOrDomain.trim().toLowerCase();
      store = await this.db.queryOne<StoreEntity>(
        `SELECT s.id, s.slug, s.name, s.status, s."customDomain", s."domainStatus", s."createdAt", s."updatedAt"
         FROM "Store" s
         LEFT JOIN "CustomDomain" cd ON cd."storeId" = s.id
         WHERE (
           (s."customDomain" = $1 AND s."domainStatus" = 'CONNECTED')
           OR (cd.domain = $1 AND cd.status = 'VERIFIED')
         ) AND s.status = 'ACTIVE'
         LIMIT 1`,
        [normalized],
      );
    }

    if (!store) return null;

    const [company, settings, theme, homePage, workingHours, paymentConfig, authConfig] = await Promise.all([
      this.db.queryOne<CompanyDetailsEntity>(
        `SELECT "businessType", address, email, phone, whatsapp, description, "logoUrl", "socialLinks"
         FROM "CompanyDetails" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.queryOne<StoreSettingsEntity>(
        `SELECT "brandsEnabled", "ordersEnabled", "codEnabled", "onlinePaymentEnabled", "whatsappOrderEnabled",
                "stockManagementType", "colorWiseStockType", "shippingType", "shippingFixedCharge",
                "shippingMinOrderAmount", "shippingFallbackCharge", "shippingDefaultWeight", "shippingWeightRates"
         FROM "StoreSettings" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.queryOne<ThemeSettingsEntity>(
        `SELECT "primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor",
                "textColor", "mutedTextColor", "navbarBg", "navbarText", "buttonBg", "buttonText",
                "h1Color", "h2Color", "paragraphColor", "buttonShape", "primaryFont"
         FROM "ThemeSettings" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.queryOne<HomePageEntity>(
        `SELECT * FROM "HomePage" WHERE "storeId" = $1`,
        [store.id],
      ),
      this.db.query<WorkingHoursEntity>(
        `SELECT * FROM "WorkingHours" WHERE "storeId" = $1 ORDER BY "dayOfWeek" ASC`,
        [store.id],
      ),
      this.db.query<{ isActive: boolean }>(
        `SELECT "isActive" FROM "MerchantPaymentConfig" WHERE "storeId" = $1 AND provider = 'razorpay' AND "isActive" = true LIMIT 1`,
        [store.id],
      ),
      this.db.queryOne<{ googleEnabled: boolean; googleClientId: string | null }>(
        `SELECT "googleEnabled", "googleClientId" FROM "MerchantAuthConfig" WHERE "storeId" = $1 LIMIT 1`,
        [store.id],
      ),
    ]);

    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      status: store.status,
      customDomain: store.customDomain,
      domainStatus: store.domainStatus,
      company,
      settings,
      theme,
      homePage,
      workingHours,
      merchantPaymentConfig: paymentConfig,
      authConfig,
    };
  }

  async getDashboardCounts(storeId: string) {
    const [orders, pendingOrders, completedOrders, totalProducts, activeProducts, totalCustomers] =
      await Promise.all([
        this.db.query<{ total: number; status: string; paymentStatus: string }>(
          `SELECT total, status, "paymentStatus" FROM "Order" WHERE "storeId" = $1`,
          [storeId],
        ),
        this.db.queryOne<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1 AND status = 'PENDING'`,
          [storeId],
        ),
        this.db.queryOne<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1 AND status = 'DELIVERED'`,
          [storeId],
        ),
        this.db.queryOne<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM "Product" WHERE "storeId" = $1`,
          [storeId],
        ),
        this.db.queryOne<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM "Product" WHERE "storeId" = $1 AND status = 'ACTIVE'`,
          [storeId],
        ),
        this.db.queryOne<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM "Customer" WHERE "storeId" = $1`,
          [storeId],
        ),
      ]);

    const totalOrders = orders.length;
    const revenue = orders
      .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      totalOrders,
      pendingOrders: pendingOrders ? parseInt(pendingOrders.count, 10) : 0,
      completedOrders: completedOrders ? parseInt(completedOrders.count, 10) : 0,
      totalProducts: totalProducts ? parseInt(totalProducts.count, 10) : 0,
      activeProducts: activeProducts ? parseInt(activeProducts.count, 10) : 0,
      totalCustomers: totalCustomers ? parseInt(totalCustomers.count, 10) : 0,
      revenue,
    };
  }

  async getColors(storeId: string) {
    return this.db.query<{ id: string; name: string; hex: string; storeId: string; createdAt: Date }>(
      `SELECT id, name, hex, "storeId", "createdAt" FROM "StoreColor" WHERE "storeId" = $1 ORDER BY "createdAt" ASC`,
      [storeId],
    );
  }

  async createColor(storeId: string, data: { name: string; hex: string }) {
    const existing = await this.db.queryOne<{ id: string; name: string; hex: string; storeId: string; createdAt: Date }>(
      `SELECT id, name, hex, "storeId", "createdAt" FROM "StoreColor" WHERE "storeId" = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
      [storeId, data.name.trim()],
    );
    if (existing) return existing;

    let hex = data.hex.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;

    return this.db.queryOne<{ id: string; name: string; hex: string; storeId: string; createdAt: Date }>(
      `INSERT INTO "StoreColor" (id, "storeId", name, hex, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING id, name, hex, "storeId", "createdAt"`,
      [storeId, data.name.trim(), hex],
    );
  }
}

