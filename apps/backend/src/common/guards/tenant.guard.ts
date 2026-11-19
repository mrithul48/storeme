// apps/api/src/common/guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../database/database.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface TenantStoreRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  ownerId: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly reflector?: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector
      ? this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ])
      : false;

    const explicitStoreId = request.headers['x-store-id'] as string | undefined;
    const storeSlug = request.headers['x-store-slug'] as string | undefined;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PUBLIC STOREFRONT REQUESTS (No user login required)
    // ─────────────────────────────────────────────────────────────────────────
    if (isPublic) {
      if (explicitStoreId) {
        const store = await this.db.queryOne<TenantStoreRow>(
          `SELECT id, slug, name, status, "ownerId" FROM "Store" WHERE id = $1`,
          [explicitStoreId],
        );
        if (!store || store.status !== 'ACTIVE') {
          throw new NotFoundException('Store not found or inactive');
        }
        request.store = store;
        request.storeId = store.id;
        return true;
      }

      if (storeSlug) {
        const store = await this.db.queryOne<TenantStoreRow>(
          `SELECT id, slug, name, status, "ownerId" FROM "Store" WHERE slug = $1`,
          [storeSlug],
        );
        if (!store || store.status !== 'ACTIVE') {
          throw new NotFoundException('Store not found or inactive');
        }
        request.store = store;
        request.storeId = store.id;
        return true;
      }

      // If user is authenticated even on a public route, resolve primary store as fallback
      if (request.user?.id) {
        const primaryStore = await this.db.queryOne<TenantStoreRow>(
          `SELECT id, slug, name, status, "ownerId" FROM "Store" WHERE "ownerId" = $1 AND status = 'ACTIVE' LIMIT 1`,
          [request.user.id],
        );
        if (primaryStore) {
          request.store = primaryStore;
          request.storeId = primaryStore.id;
          return true;
        }
      }

      throw new BadRequestException(
        'Store identifier (x-store-id or x-store-slug header) required for storefront requests',
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. AUTHENTICATED MERCHANT / ADMIN REQUESTS
    // ─────────────────────────────────────────────────────────────────────────
    const user = request.user;
    if (!user || !user.id) {
      throw new ForbiddenException('User context missing');
    }

    if (explicitStoreId) {
      const store = await this.db.queryOne<TenantStoreRow>(
        `SELECT id, slug, name, status, "ownerId" FROM "Store" WHERE id = $1`,
        [explicitStoreId],
      );

      if (!store) {
        throw new ForbiddenException(
          `Access denied: Store with ID '${explicitStoreId}' not found or unauthorized`,
        );
      }

      const isOwner = store.ownerId === user.id;
      const isPlatformAdmin = user.role === 'PLATFORM_ADMIN';

      if (!isOwner && !isPlatformAdmin) {
        throw new ForbiddenException('Access denied: You do not own or manage the requested store');
      }

      if (store.status !== 'ACTIVE' && !isPlatformAdmin) {
        throw new ForbiddenException('Access denied: Store is inactive or suspended');
      }

      if (isPlatformAdmin && !isOwner) {
        this.logger.log(
          `[PRIVILEGED_ACCESS_AUDIT] User ${user.id} (PLATFORM_ADMIN) accessed foreign store ${store.id}`,
        );
      }

      request.store = store;
      request.storeId = store.id;
      return true;
    }

    // No explicit header: resolve primary owned store
    const primaryStore = await this.db.queryOne<TenantStoreRow>(
      `SELECT id, slug, name, status, "ownerId" FROM "Store" WHERE "ownerId" = $1 AND status = 'ACTIVE' LIMIT 1`,
      [user.id],
    );

    if (!primaryStore) {
      throw new ForbiddenException('No active store found for this account');
    }

    request.store = primaryStore;
    request.storeId = primaryStore.id;
    return true;
  }
}
