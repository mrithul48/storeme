// apps/backend/src/modules/stores/stores.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';
import { StoresRepository } from './repositories/stores.repository';
import { generateUniqueSlug } from './utils/slug.util';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdatePoliciesDto } from './dto/update-policies.dto';
import { UpdateHomePageDto } from './dto/update-homepage.dto';
import { ThemeSettingsEntity } from './interfaces/store-entities.interface';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    private readonly storesRepo: StoresRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  private getStorefrontCacheKey(slugOrDomain: string): string {
    return `cache:storefront:${slugOrDomain.toLowerCase().trim()}`;
  }

  private async invalidateStorefrontCache(storeId: string) {
    try {
      const store = await this.storesRepo.findStoreById(storeId);
      if (store) {
        if (store.slug) {
          await this.redis.del(this.getStorefrontCacheKey(store.slug)).catch(() => {});
        }
        if (store.customDomain) {
          await this.redis.del(this.getStorefrontCacheKey(store.customDomain)).catch(() => {});
        }
      }
    } catch {
      // Redis is optional
    }
  }

  async getStoreByOwnerId(ownerId: string) {
    if (!ownerId) return null;

    // 1. Direct lookup by ownerId
    let store = await this.storesRepo.findStoreByOwnerId(ownerId);
    if (store) return store;

    // 2. Fallback: check if ownerId is a User's googleId
    const userByGoogleId = await this.storesRepo.findUserByGoogleId(ownerId);
    if (userByGoogleId) {
      store = await this.storesRepo.findStoreByOwnerId(userByGoogleId.id);
      if (store) return store;
    }

    // 3. Fallback: check if ownerId is an email address
    if (ownerId.includes('@')) {
      const userByEmail = await this.storesRepo.findUserByEmail(ownerId);
      if (userByEmail) {
        return this.storesRepo.findStoreByOwnerId(userByEmail.id);
      }
    }

    return null;
  }

  async getStoreById(storeId: string) {
    const store = await this.storesRepo.findStoreById(storeId);
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
    return store;
  }

  async userHasStore(ownerId: string): Promise<boolean> {
    if (!ownerId) return false;
    const store = await this.getStoreByOwnerId(ownerId);
    return Boolean(store);
  }

  async createStore(ownerId: string, data: CreateStoreDto) {
    const existing = await this.userHasStore(ownerId);
    if (existing) {
      throw new ConflictException('You already have a store');
    }

    const existingSlugs = await this.storesRepo.getAllSlugs();
    const slug = generateUniqueSlug(data.businessName, existingSlugs);

    const basicPlan = await this.storesRepo.findCheapestActivePlan();

    const now = new Date();
    const oneYearFromNow = new Date(now);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    return this.db.withTransaction(async (client) => {
      const storeId = crypto.randomUUID();

      const store = await this.storesRepo.createStore(client, {
        id: storeId,
        slug,
        name: data.businessName,
        ownerId,
        status: 'ACTIVE',
      });

      await this.storesRepo.createCompanyDetails(client, {
        id: crypto.randomUUID(),
        storeId: store.id,
        businessType: data.businessType,
        address: data.businessAddress || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        logoPublicId: data.logoPublicId || null,
        socialLinks: data.socialLinks ? (data.socialLinks as Record<string, unknown>) : null,
      });

      await this.storesRepo.createStoreSettings(client, {
        id: crypto.randomUUID(),
        storeId: store.id,
        brandsEnabled: false,
        ordersEnabled: true,
      });

      const themeData = data.theme ?? {};
      await this.storesRepo.createThemeSettings(client, {
        id: crypto.randomUUID(),
        storeId: store.id,
        primaryColor: themeData.primaryColor ?? '#22c55e',
        secondaryColor: themeData.secondaryColor ?? '#f0fdf4',
        accentColor: themeData.accentColor ?? '#16a34a',
        backgroundColor: themeData.backgroundColor ?? '#ffffff',
        surfaceColor: themeData.surfaceColor ?? '#f6faf7',
        textColor: themeData.textColor ?? '#111827',
        mutedTextColor: themeData.mutedTextColor ?? '#6b7280',
        navbarBg: themeData.navbarBg ?? '#ffffff',
        navbarText: themeData.navbarText ?? '#111827',
        buttonShape: (themeData.buttonShape as 'SQUARE' | 'ROUNDED' | 'MEDIUM_ROUNDED' | 'PILL') ?? 'MEDIUM_ROUNDED',
        primaryFont: themeData.primaryFont ?? 'Inter',
      });

      if (data.workingHours && data.workingHours.length > 0) {
        await this.storesRepo.createWorkingHoursBatch(
          client,
          data.workingHours.map((day) => ({
            id: crypto.randomUUID(),
            storeId: store.id,
            dayOfWeek: day.dayOfWeek,
            isOpen: day.isOpen,
            openTime: day.openTime || null,
            closeTime: day.closeTime || null,
          })),
        );
      }

      await this.storesRepo.createHomePage(client, {
        id: crypto.randomUUID(),
        storeId: store.id,
        heroType: 'SLIDER',
        heroEnabled: true,
        aboutEnabled: false,
      });

      if (basicPlan) {
        await this.storesRepo.createSubscription(client, {
          id: crypto.randomUUID(),
          storeId: store.id,
          planId: basicPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: oneYearFromNow,
        });
      }

      return store;
    });
  }

  async updateStore(storeId: string, body: UpdateStoreDto) {
    const { name, company, settings } = body;

    await this.db.withTransaction(async (client) => {
      if (name) {
        await this.storesRepo.updateStoreName(client, storeId, name);
      }

      if (company) {
        await this.storesRepo.updateCompanyDetails(client, storeId, {
          ...(company.businessType ? { businessType: company.businessType } : {}),
          ...(company.address !== undefined ? { address: company.address } : {}),
          ...(company.email !== undefined ? { email: company.email } : {}),
          ...(company.phone !== undefined ? { phone: company.phone } : {}),
          ...(company.whatsapp !== undefined ? { whatsapp: company.whatsapp } : {}),
          ...(company.description !== undefined ? { description: company.description } : {}),
          ...(company.logoUrl !== undefined ? { logoUrl: company.logoUrl } : {}),
          ...(company.logoPublicId !== undefined ? { logoPublicId: company.logoPublicId } : {}),
          ...(company.socialLinks !== undefined
            ? { socialLinks: company.socialLinks as Record<string, string> }
            : {}),
        });
      }

      if (settings) {
        const existingSettings = await this.storesRepo.findStoreSettings(client, storeId);

        const isStockTypeChanging =
          Boolean(existingSettings?.stockManagementType) &&
          Boolean(settings.stockManagementType) &&
          (existingSettings?.stockManagementType !== settings.stockManagementType ||
            (settings.stockManagementType === 'COLOR_WISE' &&
              Boolean(settings.colorWiseStockType) &&
              existingSettings?.colorWiseStockType !== settings.colorWiseStockType));

        await this.storesRepo.upsertStoreSettings(client, storeId, {
          brandsEnabled: settings.brandsEnabled,
          ordersEnabled: settings.ordersEnabled,
          codEnabled: settings.codEnabled,
          onlinePaymentEnabled: settings.onlinePaymentEnabled,
          whatsappOrderEnabled: settings.whatsappOrderEnabled,
          stockManagementType: settings.stockManagementType as 'AVAILABILITY' | 'QUANTITY' | 'COLOR_WISE' | undefined,
          colorWiseStockType: settings.colorWiseStockType as 'AVAILABILITY' | 'QUANTITY' | undefined,
          shippingType: settings.shippingType as 'FREE' | 'FIXED' | 'ORDER_AMOUNT' | 'WEIGHT_BASED' | undefined,
          shippingFixedCharge: settings.shippingFixedCharge,
          shippingMinOrderAmount: settings.shippingMinOrderAmount,
          shippingFallbackCharge: settings.shippingFallbackCharge,
          shippingDefaultWeight: settings.shippingDefaultWeight,
          shippingWeightRates: settings.shippingWeightRates as Array<{ upToKg: number; rate: number }> | undefined,
        });

        if (isStockTypeChanging && settings.stockManagementType) {
          await this.storesRepo.updateProductsStockMode(
            client,
            storeId,
            settings.stockManagementType as 'AVAILABILITY' | 'QUANTITY' | 'COLOR_WISE',
          );
        }
      }
    });

    await this.invalidateStorefrontCache(storeId);
    return this.getStoreById(storeId);
  }

  async getTheme(storeId: string) {
    return this.storesRepo.getTheme(storeId);
  }

  async updateTheme(storeId: string, data: UpdateThemeDto) {
    const res = await this.storesRepo.upsertTheme(storeId, data as Partial<ThemeSettingsEntity>);
    await this.invalidateStorefrontCache(storeId);
    return res;
  }

  async getPolicies(storeId: string) {
    const homePage = await this.storesRepo.getHomePage(storeId);

    return (
      homePage || {
        deliveryPolicyHeading: null,
        deliveryPolicyDescription: null,
        deliveryPoints: [],
        refundPolicyHeading: null,
        refundPolicyDescription: null,
        refundPoints: [],
        privacyPolicyHeading: null,
        privacyPolicyDescription: null,
        privacyPoints: [],
      }
    );
  }

  async updatePolicies(storeId: string, data: UpdatePoliciesDto) {
    const updateData: Record<string, unknown> = {};

    if (data.policyType === 'delivery' || data.policyType === 'all' || !data.policyType) {
      if ('deliveryPolicyHeading' in data) updateData.deliveryPolicyHeading = data.deliveryPolicyHeading ?? null;
      if ('deliveryPolicyDescription' in data) updateData.deliveryPolicyDescription = data.deliveryPolicyDescription ?? null;
      if ('deliveryPoints' in data) updateData.deliveryPoints = data.deliveryPoints ? data.deliveryPoints : [];
    }

    if (data.policyType === 'refund' || data.policyType === 'all' || !data.policyType) {
      if ('refundPolicyHeading' in data) updateData.refundPolicyHeading = data.refundPolicyHeading ?? null;
      if ('refundPolicyDescription' in data) updateData.refundPolicyDescription = data.refundPolicyDescription ?? null;
      if ('refundPoints' in data) updateData.refundPoints = data.refundPoints ? data.refundPoints : [];
    }

    if (data.policyType === 'privacy' || data.policyType === 'all' || !data.policyType) {
      if ('privacyPolicyHeading' in data) updateData.privacyPolicyHeading = data.privacyPolicyHeading ?? null;
      if ('privacyPolicyDescription' in data) updateData.privacyPolicyDescription = data.privacyPolicyDescription ?? null;
      if ('privacyPoints' in data) updateData.privacyPoints = data.privacyPoints ? data.privacyPoints : [];
    }

    const res = await this.storesRepo.upsertHomePage(storeId, updateData);
    await this.invalidateStorefrontCache(storeId);
    return res;
  }

  async getHomePage(storeId: string) {
    return this.storesRepo.getHomePage(storeId);
  }

  async updateHomePage(storeId: string, data: UpdateHomePageDto) {
    // Validate heroButtonLinkValue if present
    if (data.heroButtonLinkType === 'CATEGORY' && data.heroButtonLinkValue) {
      const cat = await this.storesRepo.findCategoryInStore(data.heroButtonLinkValue, storeId);
      if (!cat) throw new BadRequestException('Invalid category selected for hero button');
    }
    if (data.heroButtonLinkType === 'PRODUCT' && data.heroButtonLinkValue) {
      const prod = await this.storesRepo.findProductInStore(data.heroButtonLinkValue, storeId);
      if (!prod) throw new BadRequestException('Invalid product selected for hero button');
    }

    // Validate offer banner link values if present
    if (data.offerBanners && Array.isArray(data.offerBanners)) {
      for (const banner of data.offerBanners) {
        if (banner.linkType === 'CATEGORY' && banner.linkValue) {
          const cat = await this.storesRepo.findCategoryInStore(banner.linkValue, storeId);
          if (!cat) throw new BadRequestException('Invalid category in offer banner');
        }
        if (banner.linkType === 'PRODUCT' && banner.linkValue) {
          const prod = await this.storesRepo.findProductInStore(banner.linkValue, storeId);
          if (!prod) throw new BadRequestException('Invalid product in offer banner');
        }
      }
    }

    const fields = [
      'heroEnabled', 'heroType', 'heroHeading', 'heroSubtitle', 'heroDescription',
      'heroImageUrl', 'heroImagePublicId', 'heroCtaText',
      'heroButtonLinkType', 'heroButtonLinkValue', 'heroBanners',
      'brandSectionEnabled', 'brandShape',
      'categorySectionEnabled', 'categoryShape', 'categoryRadius',
      'newArrivalEnabled', 'offerBanners',
      'bestSellerEnabled', 'testimonialSectionEnabled', 'testimonials',
      'allProductsEnabled',
      'productCardRadius', 'showSalePrice', 'showOriginalPrice',
      'whatsappEnabled', 'headerDeliveryInfo', 'showAccountIcon',
      'aboutEnabled', 'aboutHeading', 'aboutContent',
      'aboutImageUrl', 'aboutImagePublicId',
      'vision', 'mission', 'badges',
      'contactEnabled',
      'deliveryPolicyHeading', 'deliveryPolicyDescription', 'deliveryPoints',
      'refundPolicyHeading', 'refundPolicyDescription', 'refundPoints',
      'privacyPolicyHeading', 'privacyPolicyDescription', 'privacyPoints',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of fields) {
      if (field in data) {
        updateData[field] = (data as Record<string, unknown>)[field];
      }
    }

    const res = await this.storesRepo.upsertHomePage(storeId, updateData);
    await this.invalidateStorefrontCache(storeId);
    return res;
  }

  async getStorefrontConfig(slugOrDomain: string) {
    const cacheKey = this.getStorefrontCacheKey(slugOrDomain);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Fallback if Redis is unavailable
    }

    const store = await this.storesRepo.getStorefrontConfig(slugOrDomain);
    if (!store) {
      throw new NotFoundException(`Storefront configuration for '${slugOrDomain}' not found`);
    }

    try {
      await this.redis.set(cacheKey, JSON.stringify(store), 'EX', 60);
    } catch {
      // Non-fatal if Redis is unavailable
    }

    return store;
  }

  async getDashboardStats(storeId: string) {
    return this.storesRepo.getDashboardCounts(storeId);
  }

  async getColors(storeId: string) {
    return this.storesRepo.getColors(storeId);
  }

  async createColor(storeId: string, data: { name: string; hex: string }) {
    return this.storesRepo.createColor(storeId, data);
  }
}
