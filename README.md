# LaunchCommerce — Multi-Tenant E-Commerce Monorepo

A **production-ready, scalable multi-tenant E-Commerce SaaS platform** organized as a modern monorepo with **Next.js 16 (App Router)** frontend, **NestJS 11** backend, **Prisma ORM**, **PostgreSQL**, **Redis**, **NextAuth v5**, and **Razorpay**.

---

## 🏗️ Monorepo Architecture

```text
launchcommerce/
│
├── apps/
│   ├── frontend/                  # Next.js 16 Frontend Application (Port 3000)
│   │   ├── src/
│   │   │   ├── app/               # App Router pages & server routes
│   │   │   ├── components/        # Storefront & Dashboard UI components
│   │   │   ├── services/          # Converted API services & excluded services
│   │   │   ├── lib/               # Centralized ApiClient & auth helpers
│   │   │   └── context/           # React state contexts (Cart, Wishlist)
│   │   ├── public/                # Static public assets
│   │   ├── package.json           # @launchcommerce/frontend
│   │   ├── next.config.ts         # Next.js configuration
│   │   └── tsconfig.json          # Frontend TypeScript configuration
│   │
│   └── backend/                   # NestJS 11 Backend REST API (Port 4000)
│       ├── src/
│       │   ├── modules/           # Products, Categories, Brands, Inventory, Orders, Auth
│       │   ├── common/            # Guards, Filters, Interceptors, Decorators
│       │   ├── config/            # Environment & security configuration
│       │   ├── guards/            # Re-exported composite & tenant guards
│       │   ├── interceptors/      # Response transformation interceptors
│       │   └── main.ts            # NestJS application entry point
│       ├── test/                  # Backend unit/e2e tests
│       ├── package.json           # @launchcommerce/backend
│       └── tsconfig.json          # Backend TypeScript configuration
│
├── packages/                      # Shared Monorepo Packages
│   ├── shared-types/              # Common domain types and DTO contracts
│   ├── validation/                # Shared Zod validation schemas
│   └── api-contracts/             # Standard API request/response contracts
│
├── prisma/                        # Shared Database Layer
│   ├── schema.prisma              # Shared Prisma schema
│   ├── migrations/                # Database migration history
│   └── seed.ts                    # Synthetic seed fixtures
│
├── scripts/                       # Maintenance, Testing & Deployment Scripts
│
├── package.json                   # Root Workspace Manager
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Development & Build Commands

### Monorepo Workspaces
- `npm run build` — Build both backend and frontend applications.
- `npm run frontend:dev` — Start the Next.js frontend development server (Port 3000).
- `npm run frontend:build` — Build the Next.js frontend production bundle.
- `npm run backend:dev` — Start the NestJS backend in development watch mode (Port 4000).
- `npm run backend:build` — Build the NestJS backend API.
- `npm run backend:start` — Run the compiled NestJS backend in production mode.

### Database & Testing
- `npm run prisma:generate` — Generate the Prisma client.
- `npm run prisma:migrate` — Apply migrations.
- `npm run test:integration` — Run the full Phase 4 Next.js to NestJS integration test suite.
- `npm run test:security` — Run the JTI replay protection and guard security audit.

---

## 🌟 Service Migration Status

1. **Fully Converted Services (Consuming NestJS REST API):**
   - `product.service.ts` ➔ `/api/v1/products`
   - `category.service.ts` ➔ `/api/v1/categories`
   - `brand.service.ts` ➔ `/api/v1/brands`
   - `inventory.service.ts` ➔ `/api/v1/inventory`
   - `order.service.ts` ➔ `/api/v1/orders`

2. **Intentionally Excluded Services (Preserving Direct Database Access):**
   - `analytics.service.ts`
   - `custom-domain.service.ts`
   - `customer.service.ts`
   - `store.service.ts`
