// apps/api/src/modules/inventory/inventory.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { InventoryRepository } from './repositories/inventory.repository';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly db: DatabaseService,
  ) {}

  async findAll(storeId: string, query: QueryInventoryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const threshold = Number(query.threshold) >= 0 ? Number(query.threshold) : 5;
    const isLowStock =
      typeof query.lowStockOnly === 'string'
        ? query.lowStockOnly === 'true'
        : query.lowStockOnly;

    const { products, total } = await this.inventoryRepo.findAll(storeId, {
      search: query.search,
      lowStockOnly: isLowStock,
      threshold,
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

  async findByProduct(storeId: string, productId: string) {
    const product = await this.inventoryRepo.findByProduct(storeId, productId);

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    return {
      success: true,
      data: product,
    };
  }

  async adjustStock(storeId: string, dto: AdjustStockDto) {
    if (dto.quantity < 0) {
      throw new BadRequestException('Quantity must be non-negative');
    }

    // 1. Verify product exists within tenant
    const product = await this.inventoryRepo.findProductForAdjust(storeId, dto.productId);

    if (!product) {
      throw new NotFoundException(`Product with ID '${dto.productId}' not found in store`);
    }

    return this.db.withTransaction(async (client) => {
      // 2. Adjust Variant stock if variantId is specified
      if (dto.variantId) {
        const variant = await this.inventoryRepo.findVariantForAdjust(dto.productId, dto.variantId);

        if (!variant) {
          throw new NotFoundException(
            `Variant '${dto.variantId}' not found on product '${dto.productId}'`,
          );
        }

        let newStock = variant.stock;

        if (dto.operation === 'INCREMENT') {
          newStock = await this.inventoryRepo.incrementVariantStock(client, variant.id, dto.quantity);
        } else if (dto.operation === 'DECREMENT') {
          const res = await this.inventoryRepo.decrementVariantStock(client, variant.id, dto.quantity);
          if (res === null) {
            throw new ConflictException(
              `Insufficient stock for decrement on variant '${variant.color}'. Available: ${variant.stock}, Requested decrement: ${dto.quantity}`,
            );
          }
          newStock = res;
        } else if (dto.operation === 'SET') {
          newStock = await this.inventoryRepo.setVariantStock(client, variant.id, dto.quantity);
        }

        await this.inventoryRepo.updateProductInStockFromVariants(client, dto.productId);

        this.logger.log(
          `Stock adjusted for variant '${variant.color}' (${variant.id}): op=${dto.operation}, qty=${dto.quantity}, newStock=${newStock}`,
        );

        return {
          success: true,
          data: {
            productId: dto.productId,
            variantId: variant.id,
            color: variant.color,
            operation: dto.operation,
            adjustedQuantity: dto.quantity,
            newStock,
            reason: dto.reason,
          },
        };
      }

      // 3. Adjust main Product stock
      let newStock = product.stock;

      if (dto.operation === 'INCREMENT') {
        newStock = await this.inventoryRepo.incrementProductStock(client, product.id, dto.quantity);
      } else if (dto.operation === 'DECREMENT') {
        const res = await this.inventoryRepo.decrementProductStock(client, product.id, dto.quantity);
        if (res === null) {
          throw new ConflictException(
            `Insufficient stock for decrement on product '${product.name}'. Available: ${product.stock}, Requested decrement: ${dto.quantity}`,
          );
        }
        newStock = res;
      } else if (dto.operation === 'SET') {
        newStock = await this.inventoryRepo.setProductStock(client, product.id, dto.quantity);
      }

      this.logger.log(
        `Stock adjusted for product '${product.name}' (${product.id}): op=${dto.operation}, qty=${dto.quantity}, newStock=${newStock}`,
      );

      return {
        success: true,
        data: {
          productId: product.id,
          operation: dto.operation,
          adjustedQuantity: dto.quantity,
          newStock,
          reason: dto.reason,
        },
      };
    });
  }
}
