// apps/api/src/modules/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { ProductsRepository } from './repositories/products.repository';
import { PlanEnforcementService } from '../plan-enforcement/plan-enforcement.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly db: DatabaseService,
    private readonly planEnforcementService: PlanEnforcementService,
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
    const baseSlug = this.generateSlug(baseText) || 'product';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const exists = await this.productsRepo.checkSlugExists(storeId, candidate, currentId);
      if (!exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async findAll(storeId: string, query: QueryProductDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const featured =
      typeof query.featured === 'string'
        ? query.featured === 'true'
        : query.featured;

    const validSortFields = ['name', 'price', 'stock', 'createdAt', 'updatedAt'];
    const sortBy = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const { products, total } = await this.productsRepo.findAll(storeId, {
      status: query.status,
      categoryId: query.categoryId,
      brandId: query.brandId,
      featured,
      search: query.search,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return {
      success: true,
      data: products,
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
    const product = await this.productsRepo.findOne(storeId, idOrSlug);

    if (!product) {
      throw new NotFoundException(`Product with ID or slug '${idOrSlug}' not found`);
    }

    return {
      success: true,
      data: product,
    };
  }

  async create(storeId: string, dto: CreateProductDto) {
    // 0. Enforce plan limit
    await this.planEnforcementService.validateProductCreation(storeId);

    // 1. Fetch store settings to resolve stock configuration
    const storeSettings = await this.productsRepo.findStoreSettings(storeId);

    const slug = await this.generateUniqueSlug(storeId, dto.slug || dto.name);
    const { images, variants, categoryId, brandId, salePrice, sku, weight, ...rest } = dto;

    let manageStockAvailability = false;
    let manageStockQuantity = false;
    let inStock = rest.inStock ?? true;
    let stock = rest.stock ?? 0;
    let finalVariants = variants;

    const stockMode = storeSettings?.stockManagementType || 'QUANTITY';

    if (stockMode === 'AVAILABILITY') {
      manageStockAvailability = true;
      manageStockQuantity = false;
      inStock = rest.inStock ?? true;
      stock = 0;
      finalVariants = undefined;
    } else if (stockMode === 'QUANTITY') {
      manageStockQuantity = true;
      manageStockAvailability = false;
      stock = typeof rest.stock === 'number' ? Math.max(0, rest.stock) : 0;
      inStock = stock > 0;
      finalVariants = undefined;
    } else if (stockMode === 'COLOR_WISE') {
      manageStockAvailability = false;
      manageStockQuantity = false;
      const isColorQty = storeSettings?.colorWiseStockType === 'QUANTITY';
      if (finalVariants && finalVariants.length > 0) {
        finalVariants = finalVariants.map((v, idx) => ({
          ...v,
          manageAvailability: !isColorQty,
          inStock: isColorQty ? (v.stock ?? 0) > 0 : v.inStock ?? true,
          manageQuantity: isColorQty,
          stock: isColorQty ? Math.max(0, v.stock ?? 0) : 0,
          sortOrder: v.sortOrder ?? idx,
        }));
        inStock = finalVariants.some((v) => v.inStock);
      }
    }

    const productId = crypto.randomUUID();

    const created = await this.db.withTransaction(async (client) => {
      const prod = await this.productsRepo.createProduct(client, {
        id: productId,
        storeId,
        name: dto.name,
        slug,
        description: dto.description || null,
        price: dto.price,
        salePrice: salePrice ?? null,
        sku: sku ?? null,
        weight: weight ?? null,
        manageStockAvailability,
        manageStockQuantity,
        inStock,
        stock,
        status: (dto.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED') || 'ACTIVE',
        featured: dto.featured ?? false,
        categoryId: categoryId ?? null,
        brandId: brandId ?? null,
      });

      if (images && images.length > 0) {
        for (const [idx, img] of images.entries()) {
          await this.productsRepo.createProductImage(client, {
            id: crypto.randomUUID(),
            productId,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder ?? idx,
          });
        }
      }

      if (finalVariants && finalVariants.length > 0) {
        for (const [idx, v] of finalVariants.entries()) {
          const variantId = await this.productsRepo.createProductVariant(client, {
            id: crypto.randomUUID(),
            productId,
            color: v.color,
            manageAvailability: v.manageAvailability ?? false,
            inStock: v.inStock ?? true,
            manageQuantity: v.manageQuantity ?? false,
            stock: v.stock ?? 0,
            sortOrder: v.sortOrder ?? idx,
          });

          if (v.images && v.images.length > 0) {
            for (const [imgIdx, img] of v.images.entries()) {
              await this.productsRepo.createProductVariantImage(client, {
                id: crypto.randomUUID(),
                variantId,
                url: img.url,
                publicId: img.publicId,
                altText: img.altText ?? null,
                sortOrder: img.sortOrder ?? imgIdx,
              });
            }
          }
        }
      }

      return prod;
    });

    this.logger.log(`Created product '${created.name}' (${created.id}) for store ${storeId}`);

    const fullyPopulated = await this.productsRepo.findOne(storeId, productId);

    return {
      success: true,
      data: fullyPopulated!,
    };
  }

  async update(storeId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.productsRepo.findById(storeId, id);

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    const storeSettings = await this.productsRepo.findStoreSettings(storeId);

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.slug, id);
    } else if (dto.name && dto.name !== existing.name && !dto.slug) {
      slug = await this.generateUniqueSlug(storeId, dto.name, id);
    }

    const { images, variants, categoryId, brandId, salePrice, sku, weight, ...rest } = dto;
    const updateData: Record<string, unknown> = {
      ...rest,
      slug,
      ...(salePrice !== undefined ? { salePrice: salePrice ?? null } : {}),
      ...(sku !== undefined ? { sku: sku ?? null } : {}),
      ...(weight !== undefined ? { weight: weight ?? null } : {}),
      ...(categoryId !== undefined ? { categoryId: categoryId ?? null } : {}),
      ...(brandId !== undefined ? { brandId: brandId ?? null } : {}),
    };

    let adaptedVariants = variants;
    const stockMode = storeSettings?.stockManagementType;

    if (stockMode === 'AVAILABILITY') {
      updateData.manageStockAvailability = true;
      updateData.manageStockQuantity = false;
      if (rest.inStock !== undefined) updateData.inStock = rest.inStock;
      adaptedVariants = [];
    } else if (stockMode === 'QUANTITY') {
      updateData.manageStockQuantity = true;
      updateData.manageStockAvailability = false;
      if (rest.stock !== undefined) {
        const stockVal = Math.max(0, rest.stock);
        updateData.stock = stockVal;
        updateData.inStock = stockVal > 0;
      }
      adaptedVariants = [];
    } else if (stockMode === 'COLOR_WISE') {
      updateData.manageStockQuantity = false;
      updateData.manageStockAvailability = false;
      const isColorQty = storeSettings?.colorWiseStockType === 'QUANTITY';
      if (adaptedVariants !== undefined) {
        adaptedVariants = adaptedVariants.map((v, idx) => ({
          ...v,
          manageAvailability: !isColorQty,
          inStock: isColorQty ? (v.stock ?? 0) > 0 : v.inStock ?? true,
          manageQuantity: isColorQty,
          stock: isColorQty ? Math.max(0, v.stock ?? 0) : 0,
          sortOrder: v.sortOrder ?? idx,
        }));
        updateData.inStock = adaptedVariants.some((v) => v.inStock);
      }
    }

    await this.db.withTransaction(async (client) => {
      // 1. Recreate images if provided
      if (images !== undefined) {
        await this.productsRepo.deleteProductImages(client, id);
        if (images.length > 0) {
          for (const [idx, img] of images.entries()) {
            await this.productsRepo.createProductImage(client, {
              id: crypto.randomUUID(),
              productId: id,
              url: img.url,
              publicId: img.publicId,
              altText: img.altText ?? null,
              sortOrder: img.sortOrder ?? idx,
            });
          }
        }
      }

      // 2. Recreate variants if provided
      if (adaptedVariants !== undefined) {
        await this.productsRepo.deleteProductVariants(client, id);
        if (adaptedVariants.length > 0) {
          for (const [idx, v] of adaptedVariants.entries()) {
            const variantId = await this.productsRepo.createProductVariant(client, {
              id: crypto.randomUUID(),
              productId: id,
              color: v.color,
              manageAvailability: v.manageAvailability ?? false,
              inStock: v.inStock ?? true,
              manageQuantity: v.manageQuantity ?? false,
              stock: v.stock ?? 0,
              sortOrder: v.sortOrder ?? idx,
            });

            if (v.images && v.images.length > 0) {
              for (const [imgIdx, img] of v.images.entries()) {
                await this.productsRepo.createProductVariantImage(client, {
                  id: crypto.randomUUID(),
                  variantId,
                  url: img.url,
                  publicId: img.publicId,
                  altText: img.altText ?? null,
                  sortOrder: img.sortOrder ?? imgIdx,
                });
              }
            }
          }
        }
      }

      // 3. Update main product record
      await this.productsRepo.updateProduct(client, id, updateData);
    });

    const updated = await this.productsRepo.findById(storeId, id);

    return {
      success: true,
      data: updated!,
    };
  }

  async remove(storeId: string, id: string) {
    const existing = await this.productsRepo.findById(storeId, id);

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    await this.productsRepo.deleteProduct(storeId, id);
    this.logger.log(`Deleted product '${existing.name}' (${id}) from store ${storeId}`);

    return {
      success: true,
      message: `Product '${existing.name}' successfully deleted`,
    };
  }
}
