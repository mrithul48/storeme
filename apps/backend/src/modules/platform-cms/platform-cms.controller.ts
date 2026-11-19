// apps/backend/src/modules/platform-cms/platform-cms.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import { PlatformCmsService } from './platform-cms.service';
import { UpdatePlatformCmsDto } from './dto/update-platform-cms.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@launchcommerce/shared-types';

@Controller()
@UseGuards(CompositeAuthGuard, RolesGuard)
export class PlatformCmsController {
  constructor(private readonly platformCmsService: PlatformCmsService) {}

  /**
   * Public: Get public landing page CMS content
   */
  @Get('platform/cms')
  @Public()
  async getCms() {
    return this.platformCmsService.getCms();
  }

  /**
   * Super Admin: Update landing page & platform CMS content
   */
  @Put('admin/platform/cms')
  @Roles(UserRole.PLATFORM_ADMIN)
  async updateCms(
    @Body() dto: UpdatePlatformCmsDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const adminUser = req.user || { id: 'admin', email: 'admin@launchcommerce.com' };
    return this.platformCmsService.updateCms(dto, adminUser, ip);
  }
}

