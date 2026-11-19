// apps/backend/src/modules/custom-domains/interfaces/custom-domain-entities.interface.ts

export interface CustomDomainEntity {
  id: string;
  storeId: string;
  domain: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'FAILED' | 'DISCONNECTED';
  verificationToken: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

