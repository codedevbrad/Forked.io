"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { IngredientType, StorageType } from "@prisma/client";

/** User no longer fills type/storageType/category; those come from ShopIngredient when linked. */
export async function createIngredientAction(
  name: string,
  tagIds?: string[],
  storeLinks?: string[]
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Ingredient name is required" };
    }

    // Check if ingredient already exists for this user (by ShopIngredient name)
    const existing = await prisma.ingredient.findFirst({
      where: {
        userId: session.user.id as string,
        shopIngredient: { name: name.trim() },
      },
    });

    if (existing) {
      return { success: false, error: "Ingredient already exists" };
    }

    // Verify tag ownership if tagIds provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: session.user.id as string,
        },
      });

      if (tags.length !== tagIds.length) {
        return { success: false, error: "One or more tags not found or unauthorized" };
      }
    }

    // Create ShopIngredient first (name lives there), then Ingredient linked to it
    const shop = await prisma.shopIngredient.create({
      data: {
        name: name.trim(),
        type: IngredientType.food,
        storageType: null,
        categoryId: null,
      },
    });
    const ingredient = await prisma.ingredient.create({
      data: {
        userId: session.user.id as string,
        shopIngredientId: shop.id,
        tag: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(id => ({ id }))
        } : undefined,
        storeLinks: storeLinks && storeLinks.length > 0 ? {
          create: storeLinks.filter(url => url.trim().length > 0).map(url => ({
            url: url.trim(),
          }))
        } : undefined,
      },
      include: {
        tag: true,
        storeLinks: true,
        shopIngredient: { include: { category: true } },
      },
    });

    return { success: true, data: { id: ingredient.id, name: ingredient.shopIngredient?.name ?? name.trim() } };
  } catch (error) {
    console.error("Create ingredient error:", error);
    return { success: false, error: "Failed to create ingredient" };
  }
}

export async function updateIngredientAction(
  id: string,
  name: string,
  type?: IngredientType,
  storageType?: StorageType | null,
  categoryId?: string | null,
  tagIds?: string[],
  storeLinks?: string[]
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Ingredient name is required" };
    }

    // Verify ownership
    const existing = await prisma.ingredient.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Ingredient not found" };
    }

    // Check if new name conflicts with another ingredient (by ShopIngredient name)
    const nameConflict = await prisma.ingredient.findFirst({
      where: {
        userId: session.user.id as string,
        shopIngredient: { name: name.trim() },
        id: { not: id },
      },
    });

    if (nameConflict) {
      return { success: false, error: "An ingredient with this name already exists" };
    }

    // Verify category exists if categoryId provided
    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          return { success: false, error: "Category not found" };
        }
      }
    }

    // Verify tag ownership if tagIds provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: session.user.id as string,
        },
      });

      if (tags.length !== tagIds.length) {
        return { success: false, error: "One or more tags not found or unauthorized" };
      }
    }

    const updateData: {
      tag?: { set: { id: string }[] };
      storeLinks?: { create: { url: string }[] };
    } = {};

    if (tagIds !== undefined) {
      updateData.tag = {
        set: tagIds.map(tagId => ({ id: tagId })),
      };
    }

    if (storeLinks !== undefined) {
      // Delete existing storeLinks and create new ones
      await prisma.storeLink.deleteMany({
        where: { ingredientId: id },
      });
      
      if (storeLinks.length > 0) {
        updateData.storeLinks = {
          create: storeLinks.filter(url => url.trim().length > 0).map(url => ({
            url: url.trim(),
          })),
        };
      }
    }

    // Update name on ShopIngredient (name lives there); create ShopIngredient if missing
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
      select: { shopIngredientId: true },
    });
    if (existingIngredient?.shopIngredientId) {
      const shopUpdate: { name: string; type?: IngredientType; storageType?: StorageType | null; categoryId?: string | null } = { name: name.trim() };
      if (type !== undefined) shopUpdate.type = type;
      if (storageType !== undefined) shopUpdate.storageType = storageType || null;
      if (categoryId !== undefined) shopUpdate.categoryId = categoryId || null;
      await prisma.shopIngredient.update({
        where: { id: existingIngredient.shopIngredientId },
        data: shopUpdate,
      });
    } else {
      const shop = await prisma.shopIngredient.create({
        data: {
          name: name.trim(),
          type: type ?? IngredientType.food,
          storageType: storageType ?? null,
          categoryId: categoryId ?? null,
        },
      });
      (updateData as Record<string, unknown>).shopIngredientId = shop.id;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.ingredient.update({
        where: { id },
        data: updateData,
      });
    }
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        tag: true,
        storeLinks: true,
        shopIngredient: { include: { category: true } },
      },
    });
    if (!ingredient) return { success: false, error: "Ingredient not found" };
    return { success: true, data: { id: ingredient.id, name: ingredient.shopIngredient?.name ?? name.trim() } };
  } catch (error) {
    console.error("Update ingredient error:", error);
    return { success: false, error: "Failed to update ingredient" };
  }
}

export async function deleteIngredientAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!ingredient) {
      return { success: false, error: "Ingredient not found" };
    }

    const ingredientToDelete = await prisma.ingredient.findUnique({
      where: { id },
      select: { shopIngredientId: true },
    });
    const shopIngredientIdToDelete = ingredientToDelete?.shopIngredientId ?? null;

    // Delete all related records first (since there's no cascade delete on Ingredient)
    await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { ingredientId: id } });
      await tx.storedIngredient.deleteMany({ where: { ingredientId: id } });
      await tx.shoppingListIngredient.deleteMany({ where: { ingredientId: id } });
      await tx.storeLink.deleteMany({ where: { ingredientId: id } });
      // Unlink and delete the one-to-one ShopIngredient so we don't leave orphans
      if (shopIngredientIdToDelete) {
        await tx.ingredient.update({
          where: { id },
          data: { shopIngredientId: null },
        });
        await tx.shopIngredient.delete({
          where: { id: shopIngredientIdToDelete },
        });
      }
      await tx.ingredient.delete({ where: { id } });
    });

    return { success: true };
  } catch (error) {
    console.error("Delete ingredient error:", error);
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return { success: false, error: "Ingredient not found or already deleted" };
      }
      
      if (prismaError.code === 'P2003') {
        return { 
          success: false, 
          error: "Cannot delete ingredient: it is still being used in recipes, storage locations, or shopping lists" 
        };
      }
    }
    
    // Handle generic errors with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to delete ingredient: ${errorMessage}` 
    };
  }
}

export async function getIngredientsAction() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const ingredients = await prisma.ingredient.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        tag: true,
        storeLinks: true,
        shopIngredient: { include: { category: true } },
      },
      orderBy: {
        shopIngredient: { name: "asc" },
      },
    });

    return ingredients;
  } catch (error) {
    console.error("Get ingredients error:", error);
    // Check if it's a Prisma client generation issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Cannot read properties of undefined") || 
        errorMessage.includes("ingredient")) {
      console.error("ERROR: Prisma client not generated. Please run: npx prisma generate");
      throw new Error("Prisma client needs to be regenerated. Run: npx prisma generate");
    }
    return [];
  }
}

export async function getIngredientAction(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
      include: {
        tag: true,
        storeLinks: true,
        shopIngredient: { include: { category: true } },
      },
    });

    return ingredient;
  } catch (error) {
    console.error("Get ingredient error:", error);
    return null;
  }
}
