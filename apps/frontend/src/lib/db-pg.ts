// src/lib/db-pg.ts
// Lightweight native PostgreSQL pool for the Next.js frontend.
// Used ONLY for auth callbacks (NextAuth) that must talk directly to the DB.
// All business queries go through the NestJS backend API.
// Table/column names match the schema in 002_create_users_and_auth.sql (quoted PascalCase).

import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl:
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
  });
}

export const pgPool: Pool = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pgPool;
}

// ─── Typed row matching the "User" table schema ───────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  password: string | null;
  googleId: string | null;
  emailVerified: boolean;
  role: "USER" | "PLATFORM_ADMIN";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const res = await pgPool.query<DbUser>(
    `SELECT id, email, name, avatar, password, "googleId", "emailVerified", role
       FROM "User"
      WHERE email = $1
      LIMIT 1`,
    [email.toLowerCase()]
  );
  return res.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const res = await pgPool.query<DbUser>(
    `SELECT id, email, name, avatar, password, "googleId", "emailVerified", role
       FROM "User"
      WHERE id = $1
      LIMIT 1`,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function createEmailUser(params: {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}): Promise<DbUser> {
  const { email, name, password, avatar } = params;
  const res = await pgPool.query<DbUser>(
    `INSERT INTO "User" (id, email, name, password, avatar, "emailVerified", role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, FALSE, 'USER', NOW(), NOW())
     RETURNING id, email, name, avatar, password, "googleId", "emailVerified", role`,
    [email.toLowerCase(), name, password, avatar ?? null]
  );
  return res.rows[0];
}

export async function setPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await pgPool.query(
    `UPDATE "User"
        SET "passwordResetToken"   = $1,
            "passwordResetExpires" = $2,
            "updatedAt"            = NOW()
      WHERE id = $3`,
    [tokenHash, expiresAt, userId]
  );
}

export async function consumePasswordResetToken(
  tokenHash: string,
  newPasswordHash: string
): Promise<boolean> {
  const res = await pgPool.query(
    `UPDATE "User"
        SET password               = $1,
            "passwordResetToken"   = NULL,
            "passwordResetExpires" = NULL,
            "emailVerified"        = TRUE,
            "updatedAt"            = NOW()
      WHERE "passwordResetToken" = $2
        AND "passwordResetExpires" > NOW()`,
    [newPasswordHash, tokenHash]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function upsertGoogleUser(params: {
  email: string;
  name: string | null;
  avatar: string | null;
  googleId: string;
}): Promise<DbUser> {
  const { email, name, avatar, googleId } = params;

  // Check if the user already exists
  const existing = await findUserByEmail(email);

  if (existing) {
    // Update existing user
    await pgPool.query(
      `UPDATE "User"
          SET "googleId"      = $1,
              name            = COALESCE($2, name),
              avatar          = COALESCE($3, avatar),
              "emailVerified" = TRUE,
              -- Clear unverified passwords to prevent account takeover
              password        = CASE
                                  WHEN "emailVerified" = FALSE THEN NULL
                                  ELSE password
                                END,
              "updatedAt"     = NOW()
        WHERE email = $4`,
      [googleId, name, avatar, email.toLowerCase()]
    );
    return (await findUserByEmail(email))!;
  } else {
    // Create new Google user — generate a UUID via pg
    const res = await pgPool.query<DbUser>(
      `INSERT INTO "User" (id, email, name, avatar, "googleId", "emailVerified", role, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, $1, $2, $3, $4, TRUE, 'USER', NOW(), NOW())
       RETURNING id, email, name, avatar, password, "googleId", "emailVerified", role`,
      [email.toLowerCase(), name, avatar, googleId]
    );
    return res.rows[0];
  }
}

// ─── Store Query & Persistence Helpers ────────────────────────────────────────

export interface DbStore {
  id: string;
  slug: string;
  name: string;
  status: string;
  ownerId: string;
  customDomain: string | null;
  domainStatus: string;
  createdAt: Date;
  updatedAt: Date;
  company?: any;
  settings?: any;
}

export async function findStoreByOwnerId(ownerIdOrEmail: string): Promise<DbStore | null> {
  if (!ownerIdOrEmail) return null;

  // 1. Direct query by ownerId
  let res = await pgPool.query<DbStore>(
    `SELECT id, slug, name, status, "ownerId", "customDomain", "domainStatus", "createdAt", "updatedAt"
       FROM "Store"
      WHERE "ownerId" = $1
      LIMIT 1`,
    [ownerIdOrEmail]
  );

  let store = res.rows[0] ?? null;

  // 2. If not found, check if it's an email address or resolve user by email
  if (!store) {
    let userId: string | null = null;
    if (ownerIdOrEmail.includes("@")) {
      const u = await findUserByEmail(ownerIdOrEmail);
      if (u) userId = u.id;
    }

    // 3. Fallback: check if ownerId is a googleId
    if (!userId) {
      const gRes = await pgPool.query<{ id: string }>(
        `SELECT id FROM "User" WHERE "googleId" = $1 LIMIT 1`,
        [ownerIdOrEmail]
      );
      if (gRes.rows[0]) userId = gRes.rows[0].id;
    }

    if (userId) {
      res = await pgPool.query<DbStore>(
        `SELECT id, slug, name, status, "ownerId", "customDomain", "domainStatus", "createdAt", "updatedAt"
           FROM "Store"
          WHERE "ownerId" = $1
          LIMIT 1`,
        [userId]
      );
      store = res.rows[0] ?? null;
    }
  }

  if (!store) return null;

  try {
    const [companyRes, settingsRes] = await Promise.all([
      pgPool.query(`SELECT * FROM "CompanyDetails" WHERE "storeId" = $1 LIMIT 1`, [store.id]),
      pgPool.query(`SELECT * FROM "StoreSettings" WHERE "storeId" = $1 LIMIT 1`, [store.id]),
    ]);
    store.company = companyRes.rows[0] ?? null;
    store.settings = settingsRes.rows[0] ?? null;
  } catch {
    // Non-fatal
  }

  return store;
}

export async function userHasStoreDb(ownerIdOrEmail: string): Promise<boolean> {
  const store = await findStoreByOwnerId(ownerIdOrEmail);
  return Boolean(store);
}

// ─── Storefront Config (full public view, matches NestJS repository query) ────

export interface DbStorefrontConfig {
  id: string;
  slug: string;
  name: string;
  status: string;
  customDomain: string | null;
  domainStatus: string;
  company: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  theme: Record<string, unknown> | null;
  homePage: Record<string, unknown> | null;
  workingHours: Record<string, unknown>[];
  merchantPaymentConfig: Array<{ isActive: boolean }>;
  authConfig: { googleEnabled: boolean; googleClientId: string | null } | null;
}

export async function findStorefrontConfigDb(
  slugOrDomain: string
): Promise<DbStorefrontConfig | null> {
  // 1. Try by slug
  let storeRes = await pgPool.query<{
    id: string;
    slug: string;
    name: string;
    status: string;
    customDomain: string | null;
    domainStatus: string;
  }>(
    `SELECT id, slug, name, status, "customDomain", "domainStatus"
       FROM "Store" WHERE slug = $1 LIMIT 1`,
    [slugOrDomain]
  );

  // 2. Fallback by verified custom domain
  if (storeRes.rows.length === 0) {
    const normalized = slugOrDomain.trim().toLowerCase();
    storeRes = await pgPool.query(
      `SELECT s.id, s.slug, s.name, s.status, s."customDomain", s."domainStatus"
         FROM "Store" s
         LEFT JOIN "CustomDomain" cd ON cd."storeId" = s.id
        WHERE (
          (s."customDomain" = $1 AND s."domainStatus" = 'CONNECTED')
          OR (cd.domain = $1 AND cd.status = 'VERIFIED')
        ) AND s.status = 'ACTIVE'
        LIMIT 1`,
      [normalized]
    );
  }

  const store = storeRes.rows[0] ?? null;
  if (!store) return null;

  const [
    companyRes,
    settingsRes,
    themeRes,
    homePageRes,
    workingHoursRes,
    paymentRes,
    authRes,
  ] = await Promise.all([
    pgPool.query(
      `SELECT "businessType", address, email, phone, whatsapp, description, "logoUrl", "socialLinks"
         FROM "CompanyDetails" WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    ),
    pgPool.query(
      `SELECT "brandsEnabled", "ordersEnabled", "codEnabled", "onlinePaymentEnabled", "whatsappOrderEnabled",
              "stockManagementType", "colorWiseStockType", "shippingType", "shippingFixedCharge",
              "shippingMinOrderAmount", "shippingFallbackCharge", "shippingDefaultWeight", "shippingWeightRates"
         FROM "StoreSettings" WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    ),
    pgPool.query(
      `SELECT "primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor",
              "textColor", "mutedTextColor", "navbarBg", "navbarText", "buttonBg", "buttonText",
              "h1Color", "h2Color", "paragraphColor", "buttonShape", "primaryFont"
         FROM "ThemeSettings" WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    ),
    pgPool.query(
      `SELECT * FROM "HomePage" WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    ),
    pgPool.query(
      `SELECT * FROM "WorkingHours" WHERE "storeId" = $1 ORDER BY "dayOfWeek" ASC`,
      [store.id]
    ),
    pgPool.query<{ isActive: boolean }>(
      `SELECT "isActive" FROM "MerchantPaymentConfig"
        WHERE "storeId" = $1 AND provider = 'razorpay' AND "isActive" = true LIMIT 1`,
      [store.id]
    ),
    pgPool.query<{ googleEnabled: boolean; googleClientId: string | null }>(
      `SELECT "googleEnabled", "googleClientId" FROM "MerchantAuthConfig"
        WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    ),
  ]);

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    status: store.status,
    customDomain: store.customDomain,
    domainStatus: store.domainStatus,
    company: companyRes.rows[0] ?? null,
    settings: settingsRes.rows[0] ?? null,
    theme: themeRes.rows[0] ?? null,
    homePage: homePageRes.rows[0] ?? null,
    workingHours: workingHoursRes.rows,
    merchantPaymentConfig: paymentRes.rows,
    authConfig: authRes.rows[0] ?? null,
  };
}

export async function createStoreDirectDb(
  ownerId: string,
  data: {
    businessName: string;
    businessType?: string;
    businessAddress?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    description?: string;
    theme?: {
      primaryColor?: string;
      accentColor?: string;
    };
  }
): Promise<{ id: string; slug: string; name: string }> {
  let realOwnerId = ownerId;
  const user = await findUserById(ownerId);
  if (!user) {
    const userByEmail = await findUserByEmail(ownerId);
    if (userByEmail) realOwnerId = userByEmail.id;
  }

  const existing = await findStoreByOwnerId(realOwnerId);
  if (existing) {
    throw new Error("You already have a store");
  }

  const baseSlug = (data.businessName || "store")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "store";

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const slugCheck = await pgPool.query(`SELECT id FROM "Store" WHERE slug = $1 LIMIT 1`, [slug]);
    if (slugCheck.rows.length === 0) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const planRes = await pgPool.query<{ id: string }>(
    `SELECT id FROM "Plan" WHERE status = 'ACTIVE' ORDER BY price ASC LIMIT 1`
  );
  const planId = planRes.rows[0]?.id;

  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    const storeRes = await client.query<{ id: string; slug: string; name: string }>(
      `INSERT INTO "Store" (id, slug, name, "ownerId", status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'ACTIVE', NOW(), NOW())
       RETURNING id, slug, name`,
      [slug, data.businessName, realOwnerId]
    );
    const store = storeRes.rows[0];

    await client.query(
      `INSERT INTO "CompanyDetails" (id, "storeId", "businessType", address, email, phone, whatsapp, description, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        store.id,
        data.businessType || "RETAIL",
        data.businessAddress || null,
        data.email || null,
        data.phone || null,
        data.whatsapp || null,
        data.description || null,
      ]
    );

    await client.query(
      `INSERT INTO "StoreSettings" (id, "storeId", "brandsEnabled", "ordersEnabled", "codEnabled", "onlinePaymentEnabled", "whatsappOrderEnabled", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, FALSE, TRUE, TRUE, TRUE, FALSE, NOW(), NOW())`,
      [store.id]
    );

    const primaryColor = data.theme?.primaryColor || "#22c55e";
    const accentColor = data.theme?.accentColor || "#16a34a";
    await client.query(
      `INSERT INTO "ThemeSettings" (id, "storeId", "primaryColor", "accentColor", "buttonShape", "primaryFont", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'MEDIUM_ROUNDED', 'Inter', NOW(), NOW())`,
      [store.id, primaryColor, accentColor]
    );

    await client.query(
      `INSERT INTO "HomePage" (id, "storeId", "heroEnabled", "heroType", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, TRUE, 'SLIDER', NOW(), NOW())`,
      [store.id]
    );

    if (planId) {
      const now = new Date();
      const oneYear = new Date(now);
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      await client.query(
        `INSERT INTO "Subscription" (id, "storeId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, 'ACTIVE', $3, $4, NOW(), NOW())`,
        [store.id, planId, now, oneYear]
      );
    }

    await client.query("COMMIT");
    return store;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
