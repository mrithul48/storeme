// src/services/category.service.ts
// Business logic for category and brand management

import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/utils";
import type { CreateCategoryInput, CreateBrandInput } from "@/validations/category.schema";

export async function listCategories(storeId: string) {
  return prisma.category.findMany({
    where: { storeId },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function createCategory(storeId: string, data: CreateCategoryInput) {
  const existing = await prisma.category.findMany({
    where: { storeId },
    select: { slug: true },
  });
  const existingSlugs = existing.map((c) => c.slug);
  const slug = data.slug
    ? generateUniqueSlug(data.slug, existingSlugs)
    : generateUniqueSlug(data.name, existingSlugs);

  return prisma.category.create({
    data: {
      storeId,
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      imagePublicId: data.imagePublicId || null,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? "ACTIVE",
    },
  });
}

export async function updateCategory(
  storeId: string,
  id: string,
  data: Partial<CreateCategoryInput>
) {
  const category = await prisma.category.findFirst({
    where: { id, storeId },
  });
  if (!category) return null;

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
      ...(data.imagePublicId !== undefined ? { imagePublicId: data.imagePublicId || null } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function deleteCategory(storeId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, storeId },
  });
  if (!category) return false;

  await prisma.category.delete({ where: { id } });
  return true;
}

// Brand functions
export async function listBrands(storeId: string) {
  return prisma.brand.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function createBrand(storeId: string, data: CreateBrandInput) {
  const existing = await prisma.brand.findMany({
    where: { storeId },
    select: { slug: true },
  });
  const existingSlugs = existing.map((b) => b.slug);
  const slug = data.slug
    ? generateUniqueSlug(data.slug, existingSlugs)
    : generateUniqueSlug(data.name, existingSlugs);

  return prisma.brand.create({
    data: {
      storeId,
      name: data.name,
      slug,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
      status: data.status ?? "ACTIVE",
    },
  });
}

export async function updateBrand(
  storeId: string,
  id: string,
  data: Partial<CreateBrandInput>
) {
  const brand = await prisma.brand.findFirst({
    where: { id, storeId },
  });
  if (!brand) return null;

  return prisma.brand.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl || null } : {}),
      ...(data.logoPublicId !== undefined ? { logoPublicId: data.logoPublicId || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function deleteBrand(storeId: string, id: string) {
  const brand = await prisma.brand.findFirst({
    where: { id, storeId },
  });
  if (!brand) return false;

  await prisma.brand.delete({ where: { id } });
  return true;
}
