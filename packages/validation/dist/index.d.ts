import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodEnum<{
        android: "android";
        ios: "ios";
        web: "web";
    }>>;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
    deviceId: z.ZodString;
}, z.core.$strip>;
export declare const internalTokenHeaderSchema: z.ZodObject<{
    alg: z.ZodLiteral<"HS256">;
    typ: z.ZodLiteral<"LC-INTERNAL+JWT">;
    kid: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const internalTokenClaimsSchema: z.ZodObject<{
    iss: z.ZodLiteral<"launchcommerce-nextjs">;
    aud: z.ZodLiteral<"launchcommerce-nestjs">;
    sub: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<{
        USER: "USER";
        PLATFORM_ADMIN: "PLATFORM_ADMIN";
    }>;
    storeId: z.ZodOptional<z.ZodString>;
    iat: z.ZodNumber;
    exp: z.ZodNumber;
    jti: z.ZodString;
}, z.core.$strip>;
export declare const productImageSchema: z.ZodObject<{
    url: z.ZodString;
    publicId: z.ZodString;
    altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const productVariantSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    color: z.ZodString;
    manageAvailability: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inStock: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    manageQuantity: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodString;
        altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodCoercedNumber<unknown>;
    salePrice: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    weight: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    stock: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    inStock: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        DRAFT: "DRAFT";
    }>>>;
    featured: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    brandId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodString;
        altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    variants: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        manageAvailability: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        inStock: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        manageQuantity: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            publicId: z.ZodString;
            altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    salePrice: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
    sku: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
    stock: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
    inStock: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        DRAFT: "DRAFT";
    }>>>>;
    featured: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    brandId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    images: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodString;
        altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>>>>;
    variants: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        manageAvailability: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        inStock: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        manageQuantity: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            publicId: z.ZodString;
            altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>>>;
}, z.core.$strip>;
export declare const queryProductSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        DRAFT: "DRAFT";
    }>>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    featured: z.ZodPreprocess<z.ZodOptional<z.ZodBoolean>, unknown>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        name: "name";
        stock: "stock";
        price: "price";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    imagePublicId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    imagePublicId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
}, z.core.$strip>;
export declare const queryCategorySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
export declare const createBrandSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    logoPublicId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>>;
}, z.core.$strip>;
export declare const updateBrandSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    logoPublicId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>>>;
}, z.core.$strip>;
export declare const queryBrandSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
export declare const adjustStockSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    operation: z.ZodEnum<{
        INCREMENT: "INCREMENT";
        DECREMENT: "DECREMENT";
        SET: "SET";
    }>;
    quantity: z.ZodCoercedNumber<unknown>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const queryInventorySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodOptional<z.ZodString>;
    lowStockOnly: z.ZodPreprocess<z.ZodOptional<z.ZodBoolean>, unknown>;
    threshold: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const orderItemInputSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    variantColor: z.ZodOptional<z.ZodString>;
    quantity: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        variantColor: z.ZodOptional<z.ZodString>;
        quantity: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
    customer: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        pincode: z.ZodString;
    }, z.core.$strip>;
    paymentMethod: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        COD: "COD";
        RAZORPAY: "RAZORPAY";
        WHATSAPP: "WHATSAPP";
    }>>>;
    orderChannel: z.ZodOptional<z.ZodEnum<{
        COD: "COD";
        WHATSAPP: "WHATSAPP";
        ONLINE_PAYMENT: "ONLINE_PAYMENT";
    }>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PROCESSING: "PROCESSING";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const queryOrderSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PROCESSING: "PROCESSING";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        REFUNDED: "REFUNDED";
        PAID: "PAID";
        FAILED: "FAILED";
    }>>;
    orderChannel: z.ZodOptional<z.ZodEnum<{
        COD: "COD";
        WHATSAPP: "WHATSAPP";
        ONLINE_PAYMENT: "ONLINE_PAYMENT";
    }>>;
    customerId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type QueryCategoryInput = z.infer<typeof queryCategorySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type QueryBrandInput = z.infer<typeof queryBrandSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type QueryOrderInput = z.infer<typeof queryOrderSchema>;
