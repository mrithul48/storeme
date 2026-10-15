// src/app/api/stores/current/route.ts
// GET  — get authenticated user's store
// PUT  — update store details (company, settings, working hours)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { updateCompanyDetailsSchema } from "@/validations/store.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("[GET /api/stores/current]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, company, settings } = body;

    await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.store.update({
          where: { id: store.id },
          data: { name },
        });
      }

      if (company) {
        const parsed = updateCompanyDetailsSchema.safeParse(company);
        if (parsed.success) {
          await tx.companyDetails.update({
            where: { storeId: store.id },
            data: {
              ...(parsed.data.businessType ? { businessType: parsed.data.businessType } : {}),
              ...(parsed.data.address !== undefined ? { address: parsed.data.address } : {}),
              ...(parsed.data.email !== undefined ? { email: parsed.data.email } : {}),
              ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
              ...(parsed.data.whatsapp !== undefined ? { whatsapp: parsed.data.whatsapp } : {}),
              ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
              ...(parsed.data.logoUrl !== undefined ? { logoUrl: parsed.data.logoUrl } : {}),
              ...(parsed.data.socialLinks !== undefined
                ? { socialLinks: JSON.parse(JSON.stringify(parsed.data.socialLinks)) }
                : {}),
            },
          });
        }
      }

      if (settings) {
        const existingSettings = await tx.storeSettings.findUnique({
          where: { storeId: store.id },
          select: { stockManagementType: true, colorWiseStockType: true },
        });

        const isStockTypeChanging =
          Boolean(existingSettings?.stockManagementType) &&
          Boolean(settings.stockManagementType) &&
          (existingSettings?.stockManagementType !== settings.stockManagementType ||
            (settings.stockManagementType === "COLOR_WISE" &&
              Boolean(settings.colorWiseStockType) &&
              existingSettings?.colorWiseStockType !== settings.colorWiseStockType));

        await tx.storeSettings.upsert({
          where: { storeId: store.id },
          create: {
            storeId: store.id,
            brandsEnabled: settings.brandsEnabled ?? false,
            ordersEnabled: settings.ordersEnabled ?? true,
            codEnabled: settings.codEnabled ?? true,
            onlinePaymentEnabled: settings.onlinePaymentEnabled ?? true,
            whatsappOrderEnabled: settings.whatsappOrderEnabled ?? false,
            stockManagementType: settings.stockManagementType ?? null,
            colorWiseStockType: settings.colorWiseStockType ?? null,
          },
          update: {
            ...(settings.brandsEnabled !== undefined ? { brandsEnabled: settings.brandsEnabled } : {}),
            ...(settings.ordersEnabled !== undefined ? { ordersEnabled: settings.ordersEnabled } : {}),
            ...(settings.codEnabled !== undefined ? { codEnabled: settings.codEnabled } : {}),
            ...(settings.onlinePaymentEnabled !== undefined ? { onlinePaymentEnabled: settings.onlinePaymentEnabled } : {}),
            ...(settings.whatsappOrderEnabled !== undefined ? { whatsappOrderEnabled: settings.whatsappOrderEnabled } : {}),
            ...(settings.stockManagementType !== undefined ? { stockManagementType: settings.stockManagementType } : {}),
            ...(settings.colorWiseStockType !== undefined ? { colorWiseStockType: settings.colorWiseStockType } : {}),
          },
        });

        if (isStockTypeChanging) {
          if (settings.stockManagementType === "AVAILABILITY") {
            await tx.product.updateMany({
              where: { storeId: store.id },
              data: {
                manageStockAvailability: true,
                manageStockQuantity: false,
                inStock: true,
                stock: 0,
              },
            });
          } else if (settings.stockManagementType === "QUANTITY") {
            await tx.product.updateMany({
              where: { storeId: store.id },
              data: {
                manageStockQuantity: true,
                manageStockAvailability: false,
                stock: 0,
                inStock: false,
              },
            });
          } else if (settings.stockManagementType === "COLOR_WISE") {
            await tx.product.updateMany({
              where: { storeId: store.id },
              data: {
                manageStockAvailability: false,
                manageStockQuantity: false,
                stock: 0,
                inStock: false,
              },
            });
          }
        }
      }
    });

    const updated = await getStoreByOwnerId(session.user.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/stores/current]", error);
    return NextResponse.json({ success: false, error: "Failed to update store" }, { status: 500 });
  }
}
