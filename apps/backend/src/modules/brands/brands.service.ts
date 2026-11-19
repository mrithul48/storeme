// apps/api/src/modules/brands/brands.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BrandsRepository } from './repositories/brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    private readonly brandsRepo: BrandsRepository,
    private readonly db: DatabaseService,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(storeId: string, baseText: string, currentId?: string): Promise<string> {
    const baseSlug = this.generateSlug(baseText) || 'brand';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const exists = await this.brandsRepo.checkSlugExists(storeId, candidate, currentId);
      if (!exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async findAll(storeId: string, query: QueryBrandDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const { brands, total } = await this.brandsRepo.findAll(storeId, {
      status: query.status,
      search: query.search,
      skip,
      limit,
    });

    return {
      success: true,
      data: brands,
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

  async findOne(storeId: string, idOrSlug: string) {
    const brand = await this.brandsRepo.findOne(storeId, idOrSlug);

    if (!brand) {
      throw new NotFoundException(`Brand with ID or slug '${idOrSlug}' not found`);
    }

    return {
      success: true,
      data: brand,
    };
  }

  async create(storeId: string, dto: CreateBrandDto) {
    const slug = await this.generateUniqueSlug(storeId, dto.slug || dto.name);

    const brand = await this.brandsRepo.create({
      storeId,
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl || null,
      logoPublicId: dto.logoPublicId || null,
      status: (dto.status as 'ACTIVE' | 'ARCHIVED') || 'ACTIVE',
    });

    this.logger.log(`Created brand '${brand.name}' (${brand.id}) for store ${storeId}`);

    return {
      success: true,
      data: brand,
    };
  }

  async update(storeId: string, id: string, dto: UpdateBrandDto) {
    const existing = await this.brandsRepo.findById(storeId, id);

    if (!existing) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.slug, id);
    } else if (dto.name && dto.name !== existing.name && !dto.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.name, id);
    }

    const updated = await this.brandsRepo.update(id, {
      ...(dto.name ? { name: dto.name } : {}),
      slug,
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.logoPublicId !== undefined ? { logoPublicId: dto.logoPublicId } : {}),
      ...(dto.status ? { status: dto.status as 'ACTIVE' | 'ARCHIVED' } : {}),
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(storeId: string, id: string, force = false) {
    const brand = await this.brandsRepo.findById(storeId, id);

    if (!brand) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }

    const productCount = brand.productCount;
    if (productCount > 0 && !force) {
      throw new ConflictException(
        `Cannot delete brand associated with ${productCount} product(s). Use query parameter '?force=true' to disassociate products.`,
      );
    }

    await this.db.withTransaction(async (client) => {
      if (productCount > 0) {
        await this.brandsRepo.disassociateProducts(client, id, storeId);
      }
      await this.brandsRepo.delete(client, id);
    });

    this.logger.log(`Safely deleted brand '${brand.name}' (${id}) from store ${storeId}`);

    return {
      success: true,
      message: `Brand '${brand.name}' successfully deleted`,
    };
  }
}
