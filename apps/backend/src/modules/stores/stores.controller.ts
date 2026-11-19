// apps/backend/src/modules/stores/stores.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdatePoliciesDto } from './dto/update-policies.dto';
import { UpdateHomePageDto } from './dto/update-homepage.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('stores')
@UseGuards(CompositeAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('current')
  async getCurrentStore(
    @CurrentUser() user: any,
  ) {
    const ownerId = user?.sub || user?.id;
    if (!ownerId && !user?.storeId) {
      throw new NotFoundException('No store context available');
    }

    if (ownerId) {
      const store = await this.storesService.getStoreByOwnerId(ownerId);
      if (store) return store;
    }

    if (user?.storeId) {
      return this.storesService.getStoreById(user.storeId);
    }

    throw new NotFoundException('Store not found');
  }

  @Get('by-owner/:ownerId')
  async getStoreByOwner(@Param('ownerId') ownerId: string) {
    const store = await this.storesService.getStoreByOwnerId(ownerId);
    if (!store) {
      throw new NotFoundException(`No store found for owner ${ownerId}`);
    }
    return store;
  }

  @Get('has-store/:ownerId')
  async checkUserHasStore(@Param('ownerId') ownerId: string) {
    const hasStore = await this.storesService.userHasStore(ownerId);
    return { hasStore };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(
    @CurrentUser() user: any,
    @Body() dto: CreateStoreDto,
  ) {
    const ownerId = user?.sub || user?.id;
    return this.storesService.createStore(ownerId, dto);
  }

  @Put('current')
  @UseGuards(TenantGuard)
  async updateCurrentStore(
    @CurrentStore('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(storeId, dto);
  }

  @Get('current/theme')
  @UseGuards(TenantGuard)
  async getTheme(@CurrentStore('id') storeId: string) {
    return this.storesService.getTheme(storeId);
  }

  @Put('current/theme')
  @UseGuards(TenantGuard)
  async updateTheme(
    @CurrentStore('id') storeId: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.storesService.updateTheme(storeId, dto);
  }

  @Get('current/policies')
  @UseGuards(TenantGuard)
  async getPolicies(@CurrentStore('id') storeId: string) {
    return this.storesService.getPolicies(storeId);
  }

  @Put('current/policies')
  @UseGuards(TenantGuard)
  async updatePolicies(
    @CurrentStore('id') storeId: string,
    @Body() dto: UpdatePoliciesDto,
  ) {
    return this.storesService.updatePolicies(storeId, dto);
  }

  @Get('current/homepage')
  @UseGuards(TenantGuard)
  async getHomePage(@CurrentStore('id') storeId: string) {
    return this.storesService.getHomePage(storeId);
  }

  @Put('current/homepage')
  @UseGuards(TenantGuard)
  async updateHomePage(
    @CurrentStore('id') storeId: string,
    @Body() dto: UpdateHomePageDto,
  ) {
    return this.storesService.updateHomePage(storeId, dto);
  }

  @Get('current/stats')
  @UseGuards(TenantGuard)
  async getDashboardStats(@CurrentStore('id') storeId: string) {
    return this.storesService.getDashboardStats(storeId);
  }

  @Get('current/colors')
  @UseGuards(TenantGuard)
  async getColors(@CurrentStore('id') storeId: string) {
    return this.storesService.getColors(storeId);
  }

  @Post('current/colors')
  @UseGuards(TenantGuard)
  async createColor(
    @CurrentStore('id') storeId: string,
    @Body() dto: { name: string; hex: string },
  ) {
    return this.storesService.createColor(storeId, dto);
  }

  @Public()
  @Get('storefront/:slugOrDomain')
  async getStorefrontConfig(@Param('slugOrDomain') slugOrDomain: string) {
    return this.storesService.getStorefrontConfig(slugOrDomain);
  }
}

