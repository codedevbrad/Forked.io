"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { IngredientType, StorageType } from "@prisma/client";

export async function createIngredientAction(
  name: string,
  type: IngredientType,
  storageType?: StorageType | null,
  tagIds?: string[]
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Ingredient name is required" };
    }

    // Check if ingredient already exists for this user
    const existing = await prisma.ingredient.findUnique({
      where: {
        userId_name: {
          userId: session.user.id as string,
          name: name.trim(),
        },
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

    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        type,
        storageType: storageType || null,
        userId: session.user.id as string,
        tag: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        tag: true,
      },
    });

    return { success: true, data: { id: ingredient.id, name: ingredient.name } };
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
  tagIds?: string[]
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

    // Check if new name conflicts with another ingredient
    const nameConflict = await prisma.ingredient.findUnique({
      where: {
        userId_name: {
          userId: session.user.id as string,
          name: name.trim(),
        },
      },
    });

    if (nameConflict && nameConflict.id !== id) {
      return { success: false, error: "An ingredient with this name already exists" };
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

    const updateData: any = {
      name: name.trim(),
    };

    if (type !== undefined) {
      updateData.type = type;
    }

    if (storageType !== undefined) {
      updateData.storageType = storageType || null;
    }

    if (tagIds !== undefined) {
      updateData.tag = {
        set: tagIds.map(tagId => ({ id: tagId })),
      };
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: updateData,
      include: {
        tag: true,
      },
    });

    return { success: true, data: { id: ingredient.id, name: ingredient.name } };
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

    // Delete all related records first (since there's no cascade delete on Ingredient)
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete from recipe ingredients
      await tx.recipeIngredient.deleteMany({
        where: { ingredientId: id },
      });

      // Delete from stored ingredients
      await tx.storedIngredient.deleteMany({
        where: { ingredientId: id },
      });

      // Delete from shopping list ingredients
      await tx.shoppingListIngredient.deleteMany({
        where: { ingredientId: id },
      });

      // Finally delete the ingredient
      await tx.ingredient.delete({
        where: { id },
      });
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
      },
      orderBy: {
        name: "asc",
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
      },
    });

    return ingredient;
  } catch (error) {
    console.error("Get ingredient error:", error);
    return null;
  }
}
