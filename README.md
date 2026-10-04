# LaunchCommerce — Multi-Tenant E-Commerce Website Builder SaaS

A **production-ready, lightweight, scalable multi-tenant E-Commerce SaaS platform** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, **PostgreSQL**, **NextAuth v5**, and **Razorpay**.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Tenant Storefront Isolation
- **Dynamic Tenant Routing**: Each merchant gets an isolated storefront accessible via `/store/[storeSlug]`.
- **Dynamic Theming**: Custom brand primary/secondary colors, navbar styles, and button corner radii configured by the merchant and injected into the storefront.
- **Tenant-Scoped State**: Cart state is persisted in localStorage isolated by store slug (`store_cart_${storeSlug}`).
- **SEO Ready**: Dynamic SSR metadata generation per store and per product.

### 2. Storefront Experience (`/store/[storeSlug]`)
- **Product Catalog**: Filter by category/brand, search by keyword, sort by price and date.
- **Product Detail**: Image carousel gallery, stock indicator, strike-through discount price calculation, and rich descriptions.
- **Cart Drawer**: Responsive slide-over drawer with quantity adjustments and real-time subtotal.
- **Omnichannel Checkout**:
  - **Cash on Delivery (COD)**: Instant order creation with stock decrementing.
  - **Razorpay Online Gateway**: UPI, Credit/Debit cards, NetBanking with server-side HMAC-SHA256 signature verification.
  - **WhatsApp Direct Ordering**: One-click WhatsApp link with pre-filled product details and pricing.
- **Order Tracking & Receipt (`/store/[storeSlug]/orders/[orderNumber]`)**: Live order status tracking badge, itemized breakdown, and merchant WhatsApp support link.

### 3. Merchant Dashboard (`/dashboard`)
- **Overview Analytics**: Real-time DB aggregates for Total Revenue, Total Orders, Catalog Items, and Customers.
- **Catalog Management (`/dashboard/products`)**:
  - Full CRUD operations with SKU tracking and stock management.
  - Multi-image uploads via Cloudinary or external CDN URLs.
  - Price vs. sale price validation.
  - Live search and category filtering.
- **Taxonomy Management (`/dashboard/categories`)**: Category and brand creation with real-time product counts.
- **Order Fulfillment (`/dashboard/orders`)**:
  - Status management: `PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`.
  - Payment tracking: `PENDING` vs `PAID`.
  - Direct links to customer receipts.
- **Branding & Store Settings (`/dashboard/settings`)**:
  - Logo uploads via Cloudinary.
  - Color palette presets (Ocean Blue, Emerald Luxe, Royal Violet, Rose Crimson, etc.) + custom hex selector.
  - Business address, support email, phone, and WhatsApp numbers.
  - Shareable store link with one-click copy.

### 4. Merchant Onboarding & Authentication
- **NextAuth v5**: Google OAuth provider and 1-Click Instant Demo login.
- **Guided 3-Step Wizard (`/onboarding`)**: Store identity, contact details, and brand palette selection.
- **Transactional Creation**: Atomic creation of Store, Company Details, Settings, Theme, and Subscription.

---

## 🚀 Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_saas?schema=public"
NEXTAUTH_SECRET="your-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Cloudinary & Razorpay & Brevo
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

### 2. Database Migration & Seed
```bash
# Push Prisma schema to your database
npx prisma db push

# Seed initial plans, demo merchant, Lumina Apparel store, and sample products
npx prisma db seed
```

### 3. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing the Platform

### Instant Demo Login
1. Navigate to `/auth/signin`.
2. Click **"Sign in as Demo Store Founder"**.
3. You will immediately be authenticated and routed to `/dashboard`.
4. Test adding products, creating categories, updating order statuses, and changing brand theme colors.
5. Click **"View Live Store"** to preview your changes in real-time on `/store/lumina-apparel`.
