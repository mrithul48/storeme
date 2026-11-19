// apps/backend/src/modules/platform-cms/platform-cms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../database/redis.service';
import { AdminService } from '../admin/admin.service';
import { PlatformCmsRepository } from './repositories/platform-cms.repository';
import { UpdatePlatformCmsDto } from './dto/update-platform-cms.dto';
import { PlatformCmsEntity } from './interfaces/platform-cms-entities.interface';

const PLATFORM_CMS_CACHE_KEY = 'cache:platform:cms';

@Injectable()
export class PlatformCmsService {
  private readonly logger = new Logger(PlatformCmsService.name);

  constructor(
    private readonly cmsRepo: PlatformCmsRepository,
    private readonly redis: RedisService,
    private readonly adminService: AdminService,
  ) {}

  private async invalidateCache() {
    try {
      await this.redis.del(PLATFORM_CMS_CACHE_KEY);
    } catch {
      // Redis optional
    }
  }

  /**
   * Get public platform CMS content (cached)
   */
  async getCms() {
    try {
      const cached = await this.redis.get(PLATFORM_CMS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Proceed to DB
    }

    let cms = await this.cmsRepo.findDefaultCms();

    if (!cms) {
      cms = await this.cmsRepo.createDefaultCms();
    }

    const result = { success: true, data: cms };

    try {
      await this.redis.set(PLATFORM_CMS_CACHE_KEY, JSON.stringify(result), 'EX', 600); // 10 min TTL
    } catch {
      // Redis optional
    }

    return result;
  }

  /**
   * Super Admin: Update platform CMS content and invalidate cache
   */
  async updateCms(dto: UpdatePlatformCmsDto, adminUser: { id: string; email: string }, ip?: string) {
    const data: Partial<PlatformCmsEntity> = {};
    if (dto.platformName !== undefined) data.platformName = dto.platformName;
    if (dto.supportEmail !== undefined) data.supportEmail = dto.supportEmail;
    if (dto.heroBadge !== undefined) data.heroBadge = dto.heroBadge;
    if (dto.heroHeading !== undefined) data.heroHeading = dto.heroHeading;
    if (dto.heroDescription !== undefined) data.heroDescription = dto.heroDescription;
    if (dto.heroCtaText !== undefined) data.heroCtaText = dto.heroCtaText;
    if (dto.heroCtaLink !== undefined) data.heroCtaLink = dto.heroCtaLink;
    if (dto.pricingEnabled !== undefined) data.pricingEnabled = dto.pricingEnabled;
    if (dto.pricingHeading !== undefined) data.pricingHeading = dto.pricingHeading;
    if (dto.pricingDescription !== undefined) data.pricingDescription = dto.pricingDescription;
    if (dto.pricingBadge !== undefined) data.pricingBadge = dto.pricingBadge;
    if (dto.yearlySavingsPercent !== undefined) data.yearlySavingsPercent = dto.yearlySavingsPercent;
    if (dto.pricingFaqs !== undefined) data.pricingFaqs = dto.pricingFaqs;
    if (dto.featuresSection !== undefined) data.featuresSection = dto.featuresSection;
    if (dto.announcementBar !== undefined) data.announcementBar = dto.announcementBar;
    if (dto.announcementEnabled !== undefined) data.announcementEnabled = dto.announcementEnabled;

    const updated = await this.cmsRepo.upsertCms(data);

    await this.invalidateCache();

    await this.adminService.logAction(
      adminUser.id,
      adminUser.email,
      'PLATFORM_CMS_UPDATE',
      'PLATFORM_CMS',
      'default',
      { changes: dto },
      ip,
    );

    return {
      success: true,
      message: 'Platform CMS updated successfully',
      data: updated,
    };
  }
}
