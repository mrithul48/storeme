// apps/backend/src/modules/plans/plans.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '../../database/redis.service';
import { AdminService } from '../admin/admin.service';
import { PlansRepository } from './repositories/plans.repository';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';
import { PlanEntity } from './interfaces/plan-entities.interface';

const PUBLIC_PLANS_CACHE_KEY = 'cache:plans:public';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private readonly plansRepo: PlansRepository,
    private readonly redis: RedisService,
    private readonly adminService: AdminService,
  ) {}

  private async invalidateCache() {
    try {
      await this.redis.del(PUBLIC_PLANS_CACHE_KEY);
    } catch {
      // Redis optional
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Public: Get all active, publicly listed plans for landing page & checkout
   */
  async getPublicPlans() {
    try {
      const cached = await this.redis.get(PUBLIC_PLANS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Proceed to DB
    }

    const plans = await this.plansRepo.getPublicPlans();

    const formatted = {
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        yearlyPrice: p.yearlyPrice ? Number(p.yearlyPrice) : Number(p.price) * 12 * 0.8,
        features: Array.isArray(p.features) ? p.features : [],
        maxProducts: p.maxProducts,
        maxOrders: p.maxOrders,
        maxImages: p.maxImages,
        maxMonthlyOrders: p.maxMonthlyOrders,
        customDomainAccess: p.customDomainAccess,
        advancedAnalytics: p.advancedAnalytics,
        premiumThemes: p.premiumThemes,
        sortOrder: p.sortOrder,
        isFeatured: p.isFeatured,
        isPublic: p.isPublic,
        badge: p.badge,
        status: p.status,
      })),
    };

    try {
      await this.redis.set(PUBLIC_PLANS_CACHE_KEY, JSON.stringify(formatted), 'EX', 300); // 5 min TTL
    } catch {
      // Redis optional
    }

    return formatted;
  }

  /**
   * Super Admin: Get all plans (including inactive/deprecated) with active subscriber counts
   */
  async getAllPlansForAdmin() {
    const plans = await this.plansRepo.getAllPlansForAdmin();

    return {
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        yearlyPrice: p.yearlyPrice ? Number(p.yearlyPrice) : null,
        features: Array.isArray(p.features) ? p.features : [],
        maxProducts: p.maxProducts,
        maxOrders: p.maxOrders,
        maxImages: p.maxImages,
        maxMonthlyOrders: p.maxMonthlyOrders,
        customDomainAccess: p.customDomainAccess,
        advancedAnalytics: p.advancedAnalytics,
        premiumThemes: p.premiumThemes,
        sortOrder: p.sortOrder,
        isFeatured: p.isFeatured,
        isPublic: p.isPublic,
        badge: p.badge,
        status: p.status,
        activeSubscriptionsCount: p.activeSubscriptionsCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };
  }

  /**
   * Get single plan by ID
   */
  async getPlanById(id: string) {
    const plan = await this.plansRepo.findById(id);

    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found`);
    }

    return {
      success: true,
      data: {
        ...plan,
        price: Number(plan.price),
        yearlyPrice: plan.yearlyPrice ? Number(plan.yearlyPrice) : null,
        activeSubscriptionsCount: plan.activeSubscriptionsCount,
      },
    };
  }

  /**
   * Super Admin: Create new SaaS Plan
   */
  async createPlan(dto: CreatePlanDto, adminUser: { id: string; email: string }, ip?: string) {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Verify slug uniqueness
    const existing = await this.plansRepo.findBySlug(slug);
    if (existing) {
      throw new BadRequestException(`Plan slug '${slug}' already exists. Choose a different name or slug.`);
    }

    const created = await this.plansRepo.createPlan({
      name: dto.name,
      slug,
      description: dto.description || null,
      price: dto.price,
      yearlyPrice: dto.yearlyPrice !== undefined ? dto.yearlyPrice : null,
      features: dto.features,
      maxProducts: dto.maxProducts || null,
      maxOrders: dto.maxOrders || null,
      maxImages: dto.maxImages || null,
      maxMonthlyOrders: dto.maxMonthlyOrders || null,
      customDomainAccess: dto.customDomainAccess ?? false,
      advancedAnalytics: dto.advancedAnalytics ?? false,
      premiumThemes: dto.premiumThemes ?? false,
      sortOrder: dto.sortOrder ?? 0,
      isFeatured: dto.isFeatured ?? false,
      isPublic: dto.isPublic ?? true,
      badge: dto.badge || null,
      status: (dto.status as 'ACTIVE' | 'INACTIVE' | 'DEPRECATED') || 'ACTIVE',
      limits: dto.limits || undefined,
    });

    await this.invalidateCache();

    await this.adminService.logAction(
      adminUser.id,
      adminUser.email,
      'PLAN_CREATE',
      'PLAN',
      created.id,
      { name: created.name, price: Number(created.price), slug: created.slug },
      ip,
    );

    return {
      success: true,
      message: `Plan '${created.name}' created successfully`,
      data: {
        ...created,
        price: Number(created.price),
        yearlyPrice: created.yearlyPrice ? Number(created.yearlyPrice) : null,
      },
    };
  }

  /**
   * Super Admin: Update existing SaaS Plan
   */
  async updatePlan(id: string, dto: UpdatePlanDto, adminUser: { id: string; email: string }, ip?: string) {
    const plan = await this.plansRepo.findById(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found`);
    }

    if (dto.slug && dto.slug !== plan.slug) {
      const existing = await this.plansRepo.findBySlug(dto.slug);
      if (existing) {
        throw new BadRequestException(`Plan slug '${dto.slug}' already exists`);
      }
    }

    const data: Partial<PlanEntity> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.yearlyPrice !== undefined) data.yearlyPrice = dto.yearlyPrice;
    if (dto.features !== undefined) data.features = dto.features;
    if (dto.maxProducts !== undefined) data.maxProducts = dto.maxProducts;
    if (dto.maxOrders !== undefined) data.maxOrders = dto.maxOrders;
    if (dto.maxImages !== undefined) data.maxImages = dto.maxImages;
    if (dto.maxMonthlyOrders !== undefined) data.maxMonthlyOrders = dto.maxMonthlyOrders;
    if (dto.customDomainAccess !== undefined) data.customDomainAccess = dto.customDomainAccess;
    if (dto.advancedAnalytics !== undefined) data.advancedAnalytics = dto.advancedAnalytics;
    if (dto.premiumThemes !== undefined) data.premiumThemes = dto.premiumThemes;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic;
    if (dto.badge !== undefined) data.badge = dto.badge;
    if (dto.status !== undefined) data.status = dto.status as 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
    if (dto.limits !== undefined) data.limits = dto.limits;

    const updated = await this.plansRepo.updatePlan(id, data);

    await this.invalidateCache();

    await this.adminService.logAction(
      adminUser.id,
      adminUser.email,
      'PLAN_UPDATE',
      'PLAN',
      updated.id,
      { changes: dto },
      ip,
    );

    return {
      success: true,
      message: `Plan '${updated.name}' updated successfully`,
      data: {
        ...updated,
        price: Number(updated.price),
        yearlyPrice: updated.yearlyPrice ? Number(updated.yearlyPrice) : null,
      },
    };
  }

  /**
   * Super Admin: Deactivate Plan (Deprecate rather than destructive delete to preserve merchant subscriptions)
   */
  async deletePlan(id: string, adminUser: { id: string; email: string }, ip?: string) {
    const plan = await this.plansRepo.findById(id);

    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found`);
    }

    // Soft deprecation
    const updated = await this.plansRepo.deprecatePlan(id);

    await this.invalidateCache();

    await this.adminService.logAction(
      adminUser.id,
      adminUser.email,
      'PLAN_DEPRECATE',
      'PLAN',
      id,
      { planName: plan.name, subscribers: plan.activeSubscriptionsCount },
      ip,
    );

    return {
      success: true,
      message: `Plan '${plan.name}' has been deprecated and hidden from new subscriptions`,
      data: updated,
    };
  }
}
