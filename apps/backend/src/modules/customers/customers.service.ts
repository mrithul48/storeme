// apps/backend/src/modules/customers/customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './repositories/customers.repository';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepo: CustomersRepository) {}

  async listStoreCustomers(storeId: string, params: CustomerQueryDto) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const { customers, total } = await this.customersRepo.listStoreCustomers(storeId, {
      search: params.search,
      skip,
      limit,
    });

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getCustomerById(storeId: string, customerId: string) {
    const customer = await this.customersRepo.getCustomerById(storeId, customerId);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return customer;
  }
}
