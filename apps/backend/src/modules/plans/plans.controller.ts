// apps/backend/src/modules/plans/plans.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@launchcommerce/shared-types';

@Controller()
@UseGuards(CompositeAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * Public: List active plans for public landing page and storefront checkout
   */
  @Get('plans')
  @Public()
  async getPublicPlans() {
    return this.plansService.getPublicPlans();
  }

  /**
   * Public: Get plan details by ID
   */
  @Get('plans/:id')
  @Public()
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  /**
   * Super Admin: List all SaaS plans (including inactive/deprecated)
   */
  @Get('admin/plans')
  @Roles(UserRole.PLATFORM_ADMIN)
  async getAllPlansForAdmin() {
    return this.plansService.getAllPlansForAdmin();
  }

  /**
   * Super Admin: Create new SaaS plan
   */
  @Post('admin/plans')
  @Roles(UserRole.PLATFORM_ADMIN)
  async createPlan(@Body() dto: CreatePlanDto, @Req() req: any, @Ip() ip: string) {
    const adminUser = req.user || { id: 'admin', email: 'admin@launchcommerce.com' };
    return this.plansService.createPlan(dto, adminUser, ip);
  }

  /**
   * Super Admin: Update existing SaaS plan
   */
  @Put('admin/plans/:id')
  @Roles(UserRole.PLATFORM_ADMIN)
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const adminUser = req.user || { id: 'admin', email: 'admin@launchcommerce.com' };
    return this.plansService.updatePlan(id, dto, adminUser, ip);
  }

  /**
   * Super Admin: Deactivate/deprecate SaaS plan
   */
  @Delete('admin/plans/:id')
  @Roles(UserRole.PLATFORM_ADMIN)
  async deletePlan(@Param('id') id: string, @Req() req: any, @Ip() ip: string) {
    const adminUser = req.user || { id: 'admin', email: 'admin@launchcommerce.com' };
    return this.plansService.deletePlan(id, adminUser, ip);
  }
}

