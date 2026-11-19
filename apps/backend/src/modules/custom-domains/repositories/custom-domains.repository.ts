// apps/backend/src/modules/custom-domains/repositories/custom-domains.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import { CustomDomainEntity } from '../interfaces/custom-domain-entities.interface';

@Injectable()
export class CustomDomainsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByStoreId(storeId: string): Promise<CustomDomainEntity | null> {
    return this.db.queryOne<CustomDomainEntity>(
      `SELECT * FROM "CustomDomain" WHERE "storeId" = $1 LIMIT 1`,
      [storeId],
    );
  }

  async findStoreDomainData(storeId: string) {
    return this.db.queryOne<{
      customDomain: string | null;
      domainStatus: string | null;
      domainVerificationToken: string | null;
    }>(
      `SELECT "customDomain", "domainStatus", "domainVerificationToken" FROM "Store" WHERE id = $1`,
      [storeId],
    );
  }

  async findByDomain(domain: string) {
    return this.db.queryOne<{ storeId: string; status: string }>(
      `SELECT "storeId", status FROM "CustomDomain" WHERE domain = $1 LIMIT 1`,
      [domain],
    );
  }

  async findLegacyStoreConflict(domain: string, storeId: string) {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM "Store" WHERE "customDomain" = $1 AND id != $2 LIMIT 1`,
      [domain, storeId],
    );
  }

  async upsertCustomDomain(
    client: IDbExecutor,
    data: {
      storeId: string;
      domain: string;
      status: string;
      verificationToken: string;
      verifiedAt: Date | null;
    },
  ): Promise<CustomDomainEntity> {
    return (await client.queryOne<CustomDomainEntity>(
      `INSERT INTO "CustomDomain" (id, "storeId", domain, status, "verificationToken", "verifiedAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       ON CONFLICT ("storeId") DO UPDATE SET
         domain = EXCLUDED.domain,
         status = EXCLUDED.status,
         "verificationToken" = EXCLUDED."verificationToken",
         "verifiedAt" = EXCLUDED."verifiedAt",
         "updatedAt" = NOW()
       RETURNING *`,
      [data.storeId, data.domain, data.status, data.verificationToken, data.verifiedAt],
    ))!;
  }

  async updateStoreDomain(
    client: IDbExecutor,
    storeId: string,
    data: {
      customDomain: string | null;
      domainStatus: string;
      domainVerificationToken: string | null;
    },
  ): Promise<void> {
    await client.query(
      `UPDATE "Store"
       SET "customDomain" = $1, "domainStatus" = $2, "domainVerificationToken" = $3, "updatedAt" = NOW()
       WHERE id = $4`,
      [data.customDomain, data.domainStatus, data.domainVerificationToken, storeId],
    );
  }

  async disconnectCustomDomain(client: IDbExecutor, storeId: string): Promise<void> {
    await client.query(
      `UPDATE "CustomDomain" SET status = 'DISCONNECTED', "updatedAt" = NOW() WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async resolveStoreByDomain(hostname: string) {
    const verified = await this.db.queryOne<{
      id: string;
      slug: string;
      name: string;
      status: string;
    }>(
      `SELECT s.id, s.slug, s.name, s.status
       FROM "CustomDomain" cd
       JOIN "Store" s ON cd."storeId" = s.id
       WHERE cd.domain = $1 AND cd.status = 'VERIFIED' AND s.status = 'ACTIVE'
       LIMIT 1`,
      [hostname],
    );

    if (verified) return verified;

    return this.db.queryOne<{
      id: string;
      slug: string;
      name: string;
      status: string;
    }>(
      `SELECT id, slug, name, status
       FROM "Store"
       WHERE "customDomain" = $1 AND "domainStatus" = 'CONNECTED' AND status = 'ACTIVE'
       LIMIT 1`,
      [hostname],
    );
  }
}

