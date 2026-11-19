// apps/api/src/modules/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Helper to generate unique slug within a store.
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(storeId: string, baseText: string, currentId?: string): Promise<string> {
    const baseSlug = this.generateSlug(baseText) || 'category';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const exists = await this.categoriesRepo.checkSlugExists(storeId, candidate, currentId);
      if (!exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async findAll(storeId: string, query: QueryCategoryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const { categories, total } = await this.categoriesRepo.findAll(storeId, {
      status: query.status,
      search: query.search,
      skip,
      limit,
    });

    return {
      success: true,
      data: categories,
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
    const category = await this.categoriesRepo.findOne(storeId, idOrSlug);

    if (!category) {
      throw new NotFoundException(`Category with ID or slug '${idOrSlug}' not found`);
    }

    return {
      success: true,
      data: category,
    };
  }

  async create(storeId: string, dto: CreateCategoryDto) {
    const slug = await this.generateUniqueSlug(storeId, dto.slug || dto.name);

    const category = await this.categoriesRepo.create({
      storeId,
      name: dto.name,
      slug,
      description: dto.description || null,
      imageUrl: dto.imageUrl || null,
      imagePublicId: dto.imagePublicId || null,
      status: (dto.status as 'ACTIVE' | 'ARCHIVED') || 'ACTIVE',
      sortOrder: dto.sortOrder ?? 0,
    });

    this.logger.log(`Created category '${category.name}' (${category.id}) for store ${storeId}`);

    return {
      success: true,
      data: category,
    };
  }

  async update(storeId: string, id: string, dto: UpdateCategoryDto) {
    const existing = await this.categoriesRepo.findById(storeId, id);

    if (!existing) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.slug, id);
    } else if (dto.name && dto.name !== existing.name && !dto.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.name, id);
    }

    const updated = await this.categoriesRepo.update(id, {
      ...(dto.name ? { name: dto.name } : {}),
      slug,
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.imagePublicId !== undefined ? { imagePublicId: dto.imagePublicId } : {}),
      ...(dto.status ? { status: dto.status as 'ACTIVE' | 'ARCHIVED' } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(storeId: string, id: string, force = false) {
    const category = await this.categoriesRepo.findById(storeId, id);

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    const productCount = category.productCount;
    if (productCount > 0 && !force) {
      throw new ConflictException(
        `Cannot delete category containing ${productCount} product(s). Use query parameter '?force=true' to disassociate products.`,
      );
    }

    await this.db.withTransaction(async (client) => {
      if (productCount > 0) {
        await this.categoriesRepo.disassociateProducts(client, id, storeId);
      }
      await this.categoriesRepo.delete(client, id);
    });

    this.logger.log(`Safely deleted category '${category.name}' (${id}) from store ${storeId}`);

    return {
      success: true,
      message: `Category '${category.name}' successfully deleted`,
    };
  }
}
