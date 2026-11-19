// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CustomDomainsModule } from './modules/custom-domains/custom-domains.module';
import { CustomersModule } from './modules/customers/customers.module';
import { StoresModule } from './modules/stores/stores.module';
import { PlanEnforcementModule } from './modules/plan-enforcement/plan-enforcement.module';
import { AdminModule } from './modules/admin/admin.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlatformCmsModule } from './modules/platform-cms/platform-cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        'apps/backend/.env',
        '.env',
        'apps/frontend/.env',
      ],
      load: [configuration],
      validate: validateEnv,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'launchcommerce-dev-jwt-access-secret-32-chars-min!',
      signOptions: { expiresIn: '15m' },
    }),
    DatabaseModule,
    CommonModule,
    PlanEnforcementModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    AnalyticsModule,
    CustomDomainsModule,
    CustomersModule,
    StoresModule,
    AdminModule,
    PlansModule,
    SubscriptionsModule,
    PlatformCmsModule,
  ],
})
export class AppModule {}

