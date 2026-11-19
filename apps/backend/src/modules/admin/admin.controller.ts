// apps/backend/src/modules/admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminQueryDto, UpdateMerchantStatusDto } from './dto/admin-query.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@launchcommerce/shared-types';

@Controller('admin')
@UseGuards(CompositeAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('merchants')
  async getMerchants(@Query() query: AdminQueryDto) {
    return this.adminService.getMerchants(query);
  }

  @Get('merchants/:id')
  async getMerchantDetails(@Param('id') id: string) {
    return this.adminService.getMerchantDetails(id);
  }

  @Patch('merchants/:id/status')
  async updateMerchantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMerchantStatusDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const adminUser = req.user || { id: 'admin', email: 'admin@launchcommerce.com' };
    return this.adminService.updateMerchantStatus(id, dto, adminUser, ip);
  }

  @Get('transactions')
  async getTransactions(@Query() query: AdminQueryDto) {
    return this.adminService.getTransactions(query);
  }

  @Get('audit-logs')
  async getAuditLogs(@Query() query: AdminQueryDto) {
    return this.adminService.getAuditLogs(query);
  }

  @Get('settings')
  async getPlatformSettings() {
    return this.adminService.getPlatformSettings();
  }
}

