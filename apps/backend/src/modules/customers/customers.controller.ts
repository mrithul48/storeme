// apps/backend/src/modules/customers/customers.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';

@Controller('customers')
@UseGuards(CompositeAuthGuard, TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  listStoreCustomers(
    @CurrentStore('id') storeId: string,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customersService.listStoreCustomers(storeId, query);
  }

  @Get(':id')
  getCustomerById(
    @CurrentStore('id') storeId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.getCustomerById(storeId, id);
  }
}

