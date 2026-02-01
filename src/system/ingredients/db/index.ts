"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { IngredientType, StorageType } from "@prisma/client";

export type SystemShopIngredientRow = {
  id: string;
  name: string;
  type: string;
  storageType: string | null;
  categoryId: string | null;
  categoryName: string | null;
  userCount: number;
};

/** System view: all ShopIngredients with count of user Ingredient records linked to each. */
export async function getSystemShopIngredientsWithUserCountAction(): Promise<
  SystemShopIngredientRow[]
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const [shopIngredients, usageCounts] = await Promise.all([
      prisma.shopIngredient.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.ingredient.groupBy({
        by: ["shopIngredientId"],
        _count: { id: true },
        where: { shopIngredientId: { not: null } },
      }),
    ]);

    const countByShopId = new Map<string, number>();
    for (const row of usageCounts) {
      if (row.shopIngredientId)
        countByShopId.set(row.shopIngredientId, row._count.id);
    }

    return shopIngredients.map((si) => ({
      id: si.id,
      name: si.name,
      type: si.type,
      storageType: si.storageType,
      categoryId: si.categoryId ?? null,
      categoryName: si.category?.name ?? null,
      userCount: countByShopId.get(si.id) ?? 0,
    }));
  } catch (error) {
    console.error("Get system shop ingredients error:", error);
    return [];
  }
}

export type CreateSystemShopIngredientInput = {
  name: string;
  type: IngredientType;
  storageType?: StorageType | null;
  categoryId?: string | null;
};

export async function createSystemShopIngredientAction(
  input: CreateSystemShopIngredientInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const name = input.name?.trim();
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const created = await prisma.shopIngredient.create({
      data: {
        name,
        type: input.type,
        storageType: input.storageType ?? null,
        categoryId: input.categoryId ?? null,
      },
    });

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("Create system shop ingredient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create",
    };
  }
}

export type UpdateSystemShopIngredientInput = {
  name?: string;
  type?: IngredientType;
  storageType?: StorageType | null;
  categoryId?: string | null;
};

export async function updateSystemShopIngredientAction(
  id: string,
  input: UpdateSystemShopIngredientInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.shopIngredient.findUnique({
      where: { id },
    });
    if (!existing) {
      return { success: false, error: "Ingredient not found" };
    }

    await prisma.shopIngredient.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name.trim() }),
        ...(input.type != null && { type: input.type }),
        ...(input.storageType !== undefined && { storageType: input.storageType }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Update system shop ingredient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update",
    };
  }
}
