// apps/backend/src/modules/analytics/analytics.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, TrackEventDto } from './dto/analytics.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('analytics')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getAnalytics(
    @CurrentStore('id') storeId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getStoreAnalytics(storeId, query.timeframe);
  }

  @Public()
  @Post('events')
  @HttpCode(HttpStatus.OK)
  trackEvent(
    @CurrentStore('id') storeId: string,
    @Body() dto: TrackEventDto,
  ) {
    return this.analyticsService.trackEvent(storeId, dto);
  }
}

