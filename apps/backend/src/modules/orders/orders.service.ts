// apps/api/src/modules/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { OrderStatus } from '@launchcommerce/shared-types';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';
import { OrdersRepository } from './repositories/orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  private generateOrderNumber(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let rand = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      rand += chars[bytes[i] % chars.length];
    }
    const timeStr = Date.now().toString(36).toUpperCase();
    return `ORD-${timeStr}-${rand}`;
  }

  private calculateShipping(storeSettings: any, subtotal: number, totalWeightKg: number): number {
    if (!storeSettings) return 0;
    const shippingType = storeSettings.shippingType || 'FIXED';

    if (shippingType === 'FREE') return 0;

    const minFreeAmount = storeSettings.shippingMinOrderAmount
      ? Number(storeSettings.shippingMinOrderAmount)
      : null;
    if (minFreeAmount !== null && subtotal >= minFreeAmount) {
      return 0;
    }

    if (shippingType === 'WEIGHT_BASED') {
      const weightRates = storeSettings.shippingWeightRates;
      if (Array.isArray(weightRates) && weightRates.length > 0) {
        for (const tier of weightRates) {
          const maxWeight = tier.maxWeight ? Number(tier.maxWeight) : tier.upToKg ? Number(tier.upToKg) : Infinity;
          if (totalWeightKg <= maxWeight) {
            return Number(tier.charge ?? tier.rate) || 0;
          }
        }
      }
      return storeSettings.shippingFallbackCharge
        ? Number(storeSettings.shippingFallbackCharge)
        : 0;
    }

    return storeSettings.shippingFixedCharge
      ? Number(storeSettings.shippingFixedCharge)
      : 0;
  }

  async create(storeId: string, dto: CreateOrderDto, idempotencyKey?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 1. Idempotency Check via Redis
    const redisIdempotencyKey = idempotencyKey ? `order:idempotency:${storeId}:${idempotencyKey}` : null;
    if (redisIdempotencyKey) {
      const existingOrderId = await this.redis.get(redisIdempotencyKey);
      if (existingOrderId) {
        this.logger.log(`Idempotent order request replay. Returning order ${existingOrderId}`);
        return this.findOne(storeId, existingOrderId);
      }
    }

    // 2. Fetch products and store settings
    const productIds = Array.from(new Set(dto.items.map((i) => i.productId)));
    const [products, storeSettings] = await Promise.all([
      this.ordersRepo.findProductsForOrder(storeId, productIds),
      this.ordersRepo.findStoreSettings(storeId),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Validate product existence and inventory availability
    const errors: string[] = [];
    let totalWeight = 0;

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push(`Product with ID '${item.productId}' not found or inactive`);
        continue;
      }

      if (product.weight) {
        totalWeight += Number(product.weight) * item.quantity;
      }

      // Check variant if applicable
      if (item.variantId || item.variantColor) {
        const variant = product.variants.find(
          (v) =>
            v.id === item.variantId ||
            v.color.toLowerCase() === item.variantColor?.toLowerCase(),
        );

        if (!variant) {
          errors.push(`Variant '${item.variantColor || item.variantId}' not found for product '${product.name}'`);
          continue;
        }

        if (variant.manageQuantity && variant.stock < item.quantity) {
          errors.push(
            `Insufficient stock for '${product.name} (${variant.color})'. Available: ${variant.stock}, requested: ${item.quantity}`,
          );
        } else if (variant.manageAvailability && !variant.inStock) {
          errors.push(`Variant '${product.name} (${variant.color})' is currently out of stock`);
        }
      } else {
        // Main product stock check
        if (product.manageStockQuantity && product.stock < item.quantity) {
          errors.push(
            `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}`,
          );
        } else if (product.manageStockAvailability && !product.inStock) {
          errors.push(`Product '${product.name}' is currently out of stock`);
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }

    // 4. Recalculate price snapshots strictly from backend DB
    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      let variantColor: string | null = null;
      let variantId: string | null = null;

      if (item.variantId || item.variantColor) {
        const variant = product.variants.find(
          (v) =>
            v.id === item.variantId ||
            v.color.toLowerCase() === item.variantColor?.toLowerCase(),
        );
        if (variant) {
          variantId = variant.id;
          variantColor = variant.color;
        }
      }

      const unitPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
      const subtotal = unitPrice * item.quantity;

      return {
        productId: product.id,
        productName: variantColor ? `${product.name} (${variantColor})` : product.name,
        productSku: product.sku,
        variantId,
        variantColor,
        price: unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const shippingCharge = this.calculateShipping(storeSettings, subtotal, totalWeight);
    const total = subtotal + shippingCharge;
    const orderNumber = this.generateOrderNumber();

    // 5. Upsert Customer record per store
    const customer = await this.ordersRepo.upsertCustomer(storeId, {
      name: dto.customer.name,
      email: dto.customer.email,
      phone: dto.customer.phone || null,
    });

    // 6. Execute Atomic Order Creation and Conditional Stock Decrement in Single Transaction
    const orderId = crypto.randomUUID();

    const order = await this.db.withTransaction(async (client) => {
      // Create Order
      const newOrder = await this.ordersRepo.createOrder(client, {
        id: orderId,
        storeId,
        orderNumber,
        customerId: customer.id,
        subtotal,
        shippingCharge,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: dto.paymentMethod || 'COD',
        orderChannel:
          dto.orderChannel ||
          (dto.paymentMethod === 'RAZORPAY'
            ? 'ONLINE_PAYMENT'
            : dto.paymentMethod === 'WHATSAPP'
            ? 'WHATSAPP'
            : 'COD'),
        notes: dto.notes || null,
        shippingAddress: {
          address: dto.customer.address,
          city: dto.customer.city,
          state: dto.customer.state,
          pincode: dto.customer.pincode,
        },
      });

      // Create Order Items
      for (const item of orderItems) {
        await this.ordersRepo.createOrderItem(client, {
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          variantId: item.variantId,
          variantColor: item.variantColor,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        });
      }

      // Atomically decrement stock
      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;

        if (item.variantId) {
          const success = await this.ordersRepo.decrementVariantStock(client, item.variantId, item.quantity);

          if (!success && product.manageStockQuantity) {
            throw new ConflictException(
              `Insufficient stock during checkout for variant '${item.variantId}'. It may have just sold out.`,
            );
          }
        } else if (product.manageStockQuantity) {
          const success = await this.ordersRepo.decrementProductStock(client, product.id, item.quantity);

          if (!success) {
            throw new ConflictException(
              `Insufficient stock during checkout for '${product.name}'. It may have just sold out.`,
            );
          }
        }
      }

      return newOrder;
    });

    // Record idempotency token in Redis for 60 seconds
    if (redisIdempotencyKey) {
      await this.redis.set(redisIdempotencyKey, order.id, 'EX', 60).catch(() => {});
    }

    this.logger.log(`Created order #${order.orderNumber} (${order.id}) for store ${storeId}. Total: $${order.total}`);

    const completeOrder = await this.ordersRepo.findOne(storeId, order.id);

    return {
      success: true,
      data: completeOrder!,
    };
  }

  async findAll(storeId: string, query: QueryOrderDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const { orders, total } = await this.ordersRepo.findAll(storeId, {
      status: query.status,
      paymentStatus: query.paymentStatus,
      orderChannel: query.orderChannel,
      customerId: query.customerId,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
      skip,
      limit,
    });

    return {
      success: true,
      data: orders,
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

  async findOne(storeId: string, id: string) {
    const order = await this.ordersRepo.findOne(storeId, id);

    if (!order) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    return {
      success: true,
      data: order,
    };
  }

  async updateStatus(storeId: string, id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.ordersRepo.findOne(storeId, id);

    if (!existing) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    const currentStatus = existing.status;
    const targetStatus = dto.status || currentStatus;

    const updated = await this.db.withTransaction(async (client) => {
      // If cancelling, restore inventory atomically
      if (targetStatus === 'CANCELLED' && currentStatus !== 'CANCELLED') {
        for (const item of existing.items || []) {
          if (item.variantId) {
            await this.ordersRepo.incrementVariantStock(client, item.variantId, item.quantity);
          } else if (item.productId) {
            await this.ordersRepo.incrementProductStock(client, item.productId, item.quantity);
          }
        }
        this.logger.log(`Restored stock for cancelled order #${existing.orderNumber}`);
      }

      // If restoring from CANCELLED to an active status, re-decrement stock
      if (currentStatus === 'CANCELLED' && targetStatus !== 'CANCELLED') {
        for (const item of existing.items || []) {
          if (item.variantId) {
            await this.ordersRepo.decrementVariantStock(client, item.variantId, item.quantity);
          } else if (item.productId) {
            await this.ordersRepo.decrementProductStock(client, item.productId, item.quantity);
          }
        }
        this.logger.log(`Re-decremented stock for uncancelled order #${existing.orderNumber}`);
      }

      return this.ordersRepo.updateStatus(
        client,
        existing.id,
        dto.status,
        dto.notes,
        dto.paymentStatus,
      );
    });

    return {
      success: true,
      data: updated,
    };
  }

  async getRecent(storeId: string) {
    const orders = await this.ordersRepo.getRecent(storeId, 5);

    return {
      success: true,
      data: orders,
    };
  }

  async getSummary(storeId: string) {
    const [counts, recent] = await Promise.all([
      this.ordersRepo.getSummary(storeId),
      this.getRecent(storeId),
    ]);

    return {
      success: true,
      data: {
        ...counts,
        recentOrders: recent.data,
      },
    };
  }

  async findStorefrontOrder(orderNumber: string, storeId?: string, storeSlug?: string) {
    const order = await this.ordersRepo.findStorefrontOrder(orderNumber, storeId, storeSlug);
    if (!order) {
      throw new NotFoundException(`Order #${orderNumber} not found`);
    }
    return {
      success: true,
      data: order,
    };
  }

  async findByCustomerId(customerId: string, storeId?: string) {
    const orders = await this.ordersRepo.findByCustomerId(customerId, storeId);
    return {
      success: true,
      data: orders,
    };
  }

  async calculateOrderShipping(dto: {
    storeId?: string;
    storeSlug?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    let storeId = dto.storeId;
    if (!storeId && dto.storeSlug) {
      const store = await this.db.queryOne<{ id: string }>(
        `SELECT id FROM "Store" WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1`,
        [dto.storeSlug],
      );
      if (store) storeId = store.id;
    }

    if (!storeId) {
      throw new NotFoundException('Store not found');
    }

    const items = Array.isArray(dto.items) ? dto.items : [];
    if (items.length === 0) {
      return {
        success: true,
        data: {
          subtotal: 0,
          shippingCharge: 0,
          total: 0,
          isFree: true,
        },
      };
    }

    const productIds = items.map((i) => i.productId);
    const [products, storeSettings] = await Promise.all([
      this.ordersRepo.findProductsForOrder(storeId, productIds),
      this.ordersRepo.findStoreSettings(storeId),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) continue;
      const unitPrice = prod.salePrice ? Number(prod.salePrice) : Number(prod.price);
      subtotal += unitPrice * Math.max(1, item.quantity);
      if (prod.weight) {
        totalWeight += Number(prod.weight) * Math.max(1, item.quantity);
      }
    }

    const shippingCharge = this.calculateShipping(storeSettings, subtotal, totalWeight);
    const total = subtotal + shippingCharge;

    return {
      success: true,
      data: {
        subtotal,
        shippingCharge,
        total,
        isFree: shippingCharge === 0,
        shippingType: storeSettings?.shippingType || null,
      },
    };
  }

  async getOrderReceipts(storeId: string, orderIds: string[]) {
    const data = await this.ordersRepo.findReceipts(storeId, orderIds);
    if (!data) {
      throw new NotFoundException('Store or orders not found');
    }
    return {
      success: true,
      ...data,
    };
  }
}
