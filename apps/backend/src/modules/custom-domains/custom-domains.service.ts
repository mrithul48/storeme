// apps/backend/src/modules/custom-domains/custom-domains.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CustomDomainsRepository } from './repositories/custom-domains.repository';
import { PlanEnforcementService } from '../plan-enforcement/plan-enforcement.service';
import {
  normalizeDomain,
  validateDomain,
  generateVerificationToken,
  getDnsInstructions,
  verifyDomainDns,
} from './utils/custom-domain.util';

@Injectable()
export class CustomDomainsService {
  private readonly logger = new Logger(CustomDomainsService.name);

  constructor(
    private readonly customDomainsRepo: CustomDomainsRepository,
    private readonly db: DatabaseService,
    private readonly planEnforcementService: PlanEnforcementService,
  ) {}

  async getCustomDomain(storeId: string) {
    const record = await this.customDomainsRepo.findByStoreId(storeId);

    if (!record || record.status === 'DISCONNECTED') {
      const store = await this.customDomainsRepo.findStoreDomainData(storeId);

      if (store?.customDomain && store.domainStatus !== 'NOT_CONNECTED') {
        const instructions = getDnsInstructions(
          store.customDomain,
          store.domainVerificationToken || '',
        );

        const status =
          store.domainStatus === 'CONNECTED'
            ? 'VERIFIED'
            : store.domainStatus === 'VERIFICATION_FAILED'
            ? 'FAILED'
            : 'PENDING_VERIFICATION';

        return {
          id: storeId,
          domain: store.customDomain,
          status,
          verificationToken: store.domainVerificationToken || '',
          verifiedAt: store.domainStatus === 'CONNECTED' ? new Date() : null,
          dnsInstructions: instructions,
        };
      }

      return null;
    }

    const instructions = getDnsInstructions(record.domain, record.verificationToken);

    return {
      id: record.id,
      domain: record.domain,
      status: record.status,
      verificationToken: record.verificationToken,
      verifiedAt: record.verifiedAt,
      dnsInstructions: instructions,
    };
  }

  async registerCustomDomain(storeId: string, rawDomain: string) {
    // Enforce plan tier limits
    await this.planEnforcementService.validateCustomDomainAccess(storeId);

    const validation = validateDomain(rawDomain);
    if (!validation.valid || !validation.normalized) {
      throw new BadRequestException(validation.error || 'Invalid domain format.');
    }

    const normalizedDomain = validation.normalized;

    // Check multi-tenant uniqueness
    const existingDomain = await this.customDomainsRepo.findByDomain(normalizedDomain);

    if (existingDomain && existingDomain.storeId !== storeId && existingDomain.status !== 'DISCONNECTED') {
      throw new ConflictException('This domain is already registered to another store.');
    }

    const legacyConflict = await this.customDomainsRepo.findLegacyStoreConflict(normalizedDomain, storeId);

    if (legacyConflict) {
      throw new ConflictException('This domain is already registered to another store.');
    }

    const verificationToken = generateVerificationToken();

    const result = await this.db.withTransaction(async (client) => {
      const customDomain = await this.customDomainsRepo.upsertCustomDomain(client, {
        storeId,
        domain: normalizedDomain,
        status: 'PENDING_VERIFICATION',
        verificationToken,
        verifiedAt: null,
      });

      await this.customDomainsRepo.updateStoreDomain(client, storeId, {
        customDomain: normalizedDomain,
        domainStatus: 'PENDING_VERIFICATION',
        domainVerificationToken: verificationToken,
      });

      return customDomain;
    });

    const dnsInstructions = getDnsInstructions(normalizedDomain, verificationToken);

    return {
      id: result.id,
      domain: result.domain,
      status: 'PENDING_VERIFICATION',
      verificationToken: result.verificationToken,
      verifiedAt: null,
      dnsInstructions,
    };
  }

  async verifyCustomDomain(storeId: string) {
    const domainRecord = await this.customDomainsRepo.findByStoreId(storeId);

    let domain = domainRecord?.domain;
    let token = domainRecord?.verificationToken;

    if (!domain || !token) {
      const store = await this.customDomainsRepo.findStoreDomainData(storeId);
      domain = store?.customDomain || undefined;
      token = store?.domainVerificationToken || undefined;
    }

    if (!domain || !token) {
      throw new BadRequestException('No custom domain has been registered for this store yet.');
    }

    const verificationResult = await verifyDomainDns(domain, token);
    const newStatus = verificationResult.verified ? 'VERIFIED' : 'FAILED';
    const verifiedAt = verificationResult.verified ? new Date() : null;

    await this.db.withTransaction(async (client) => {
      await this.customDomainsRepo.upsertCustomDomain(client, {
        storeId,
        domain: domain!,
        status: newStatus,
        verificationToken: token!,
        verifiedAt,
      });

      await this.customDomainsRepo.updateStoreDomain(client, storeId, {
        customDomain: domain!,
        domainStatus: verificationResult.verified ? 'CONNECTED' : 'VERIFICATION_FAILED',
        domainVerificationToken: token!,
      });
    });

    const dnsInstructions = getDnsInstructions(domain, token);

    return {
      success: verificationResult.verified,
      data: {
        id: domainRecord?.id || storeId,
        domain,
        status: newStatus,
        verificationToken: token,
        verifiedAt,
        dnsInstructions,
      },
      verification: verificationResult,
      error: verificationResult.verified ? undefined : verificationResult.message,
    };
  }

  async disconnectCustomDomain(storeId: string) {
    await this.db.withTransaction(async (client) => {
      await this.customDomainsRepo.disconnectCustomDomain(client, storeId);
      await this.customDomainsRepo.updateStoreDomain(client, storeId, {
        customDomain: null,
        domainStatus: 'NOT_CONNECTED',
        domainVerificationToken: null,
      });
    });

    return {
      success: true,
      message: 'Custom domain successfully disconnected.',
    };
  }

  async resolveStoreByDomain(hostname: string) {
    const normalized = normalizeDomain(hostname);
    if (!normalized) return null;
    return this.customDomainsRepo.resolveStoreByDomain(normalized);
  }
}
