// apps/backend/src/modules/custom-domains/custom-domains.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomDomainsService } from './custom-domains.service';
import { RegisterDomainDto } from './dto/custom-domain.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('custom-domains')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class CustomDomainsController {
  constructor(private readonly domainsService: CustomDomainsService) {}

  @Get()
  getCustomDomain(@CurrentStore('id') storeId: string) {
    return this.domainsService.getCustomDomain(storeId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  registerCustomDomain(
    @CurrentStore('id') storeId: string,
    @Body() dto: RegisterDomainDto,
  ) {
    return this.domainsService.registerCustomDomain(storeId, dto.domain);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyCustomDomain(@CurrentStore('id') storeId: string) {
    return this.domainsService.verifyCustomDomain(storeId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  disconnectCustomDomain(@CurrentStore('id') storeId: string) {
    return this.domainsService.disconnectCustomDomain(storeId);
  }

  @Public()
  @Get('resolve/:hostname')
  resolveStoreByDomain(@Param('hostname') hostname: string) {
    return this.domainsService.resolveStoreByDomain(hostname);
  }
}

