// apps/backend/src/modules/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';
import { AdminRepository } from './repositories/admin.repository';
import { AdminQueryDto, UpdateMerchantStatusDto } from './dto/admin-query.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Record sensitive administrative operations in Audit Log
   */
  async logAction(
    adminId: string,
    adminEmail: string,
    action: string,
    entityType: string,
    entityId?: string | null,
    details?: Record<string, unknown>,
    ipAddress?: string | null,
  ) {
    try {
      await this.adminRepo.createAuditLog({
        adminId,
        adminEmail,
        action,
        entityType,
        entityId: entityId || null,
        details,
        ipAddress: ipAddress || null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to record audit log: ${msg}`);
    }
  }

  /**
   * Super Admin Overview Analytics & Metrics
   */
  async getOverview() {
    const [metrics, allSubscriptions, recentMerchants, recentPayments] = await Promise.all([
      this.adminRepo.getOverviewMetrics(),
      this.adminRepo.getAllActiveSubscriptionsForMrr(),
      this.adminRepo.getRecentMerchants(5),
      this.adminRepo.getRecentPayments(6),
    ]);

    // Calculate real Monthly Recurring Revenue (MRR)
    let mrr = 0;
    const planDistribution: Record<string, number> = {};

    for (const sub of allSubscriptions) {
      const period = sub.billingPeriod || 'YEARLY';
      const price = Number(sub.plan_price);
      const yearlyPrice = sub.plan_yearlyPrice ? Number(sub.plan_yearlyPrice) : null;
      const monthlyRate =
        period === 'MONTHLY'
          ? price
          : yearlyPrice
          ? yearlyPrice / 12
          : price / 12;

      mrr += monthlyRate;
      planDistribution[sub.plan_name] = (planDistribution[sub.plan_name] || 0) + 1;
    }

    return {
      success: true,
      data: {
        metrics: {
          totalMerchants: metrics.totalMerchants,
          activeMerchants: metrics.activeStores,
          suspendedMerchants: metrics.suspendedStores,
          totalStores: metrics.totalStores,
          totalCustomers: metrics.totalCustomers,
          totalOrders: metrics.totalOrders,
          activeSubscriptions: metrics.activeSubscriptions,
          expiredSubscriptions: metrics.expiredSubscriptions,
          mrr: Math.round(mrr * 100) / 100,
          totalSubscriptionRevenue: metrics.totalSubscriptionRevenue,
          successfulPaymentsCount: metrics.successfulPaymentsCount,
        },
        planDistribution: Object.entries(planDistribution).map(([plan, count]) => ({ plan, count })),
        recentMerchants,
        recentPayments,
      },
    };
  }

  /**
   * Merchant Management - List merchants with search, status filter, and pagination
   */
  async getMerchants(query: AdminQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const { merchants, total } = await this.adminRepo.getMerchants({
      search: query.search,
      status: query.status,
      skip,
      limit,
    });

    return {
      success: true,
      data: merchants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Merchant Management - Get single merchant detailed profile
   */
  async getMerchantDetails(id: string) {
    const merchant = await this.adminRepo.findMerchantDetails(id);

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID '${id}' not found`);
    }

    return {
      success: true,
      data: merchant,
    };
  }

  /**
   * Merchant Management - Suspend or Activate merchant account
   */
  async updateMerchantStatus(
    id: string,
    dto: UpdateMerchantStatusDto,
    adminUser: { id: string; email: string },
    ipAddress?: string,
  ) {
    const merchant = await this.adminRepo.findMerchantForStatusUpdate(id);

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID '${id}' not found`);
    }

    if (merchant.role === 'PLATFORM_ADMIN') {
      throw new BadRequestException('Platform administrators cannot be suspended through merchant controls');
    }

    const updatedStore = merchant.storeId
      ? await this.adminRepo.updateStoreStatus(merchant.storeId, dto.status)
      : null;

    // Log admin audit action
    await this.logAction(
      adminUser.id,
      adminUser.email,
      dto.status === 'SUSPENDED' ? 'MERCHANT_SUSPEND' : 'MERCHANT_ACTIVATE',
      'STORE',
      merchant.storeId || merchant.id,
      { merchantId: merchant.id, email: merchant.email, reason: dto.reason || null },
      ipAddress,
    );

    return {
      success: true,
      message: `Merchant ${dto.status === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`,
      data: {
        merchantId: merchant.id,
        status: updatedStore?.status || dto.status,
        storeStatus: updatedStore?.status,
      },
    };
  }

  /**
   * Payment & Revenue CMS - List billing transactions
   */
  async getTransactions(query: AdminQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const { transactions, total, summary } = await this.adminRepo.getTransactions({
      status: query.status,
      search: query.search,
      skip,
      limit,
    });

    return {
      success: true,
      data: transactions,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Super Admin Audit Trail
   */
  async getAuditLogs(query: AdminQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const { logs, total } = await this.adminRepo.getAuditLogs({
      search: query.search,
      skip,
      limit,
    });

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Platform Integrations & System Settings (Safe Status Inspection)
   */
  async getPlatformSettings() {
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const brevoKey = process.env.BREVO_API_KEY;
    const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
    const redisConnected = this.redis.isAvailable;

    const dbHealth = await this.db.healthCheck();

    return {
      success: true,
      data: {
        integrations: {
          razorpay: {
            configured: Boolean(razorpayKey && razorpaySecret),
            mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
            keyPrefix: razorpayKey ? razorpayKey.substring(0, 8) + '...' : 'Not configured',
          },
          brevo: {
            configured: Boolean(brevoKey),
            senderEmail: process.env.BREVO_SENDER_EMAIL || 'Not configured',
          },
          cloudinary: {
            configured: Boolean(cloudinaryKey),
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured',
          },
        },
        services: {
          database: { status: dbHealth.status === 'healthy' ? 'healthy' : 'disconnected' },
          redis: { status: redisConnected ? 'healthy' : 'disconnected' },
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 4100,
          version: '1.0.0',
        },
      },
    };
  }
}
