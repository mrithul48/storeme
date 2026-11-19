// apps/backend/src/modules/admin/interfaces/admin-entities.interface.ts

export interface AdminAuditLogEntity {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
}

