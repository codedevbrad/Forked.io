"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Unit } from "@prisma/client";

export type RecipeIngredientInput = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
};

export async function createRecipeAction(
  name: string,
  ingredients: RecipeIngredientInput[] = []
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Recipe name is required" };
    }

    // Validate ingredients belong to user
    if (ingredients.length > 0) {
      const ingredientIds = ingredients.map((i) => i.ingredientId);
      const userIngredients = await prisma.ingredient.findMany({
        where: {
          id: { in: ingredientIds },
          userId: session.user.id as string,
        },
      });

      if (userIngredients.length !== ingredientIds.length) {
        return { success: false, error: "Some ingredients are invalid" };
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        name: name.trim(),
        userId: session.user.id as string,
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
      },
    });

    return { success: true, data: { id: recipe.id, name: recipe.name } };
  } catch (error) {
    console.error("Create recipe error:", error);
    return { success: false, error: "Failed to create recipe" };
  }
}

export async function updateRecipeAction(
  id: string,
  name: string,
  ingredients: RecipeIngredientInput[] = []
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Recipe name is required" };
    }

    // Verify ownership
    const existing = await prisma.recipe.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Recipe not found" };
    }

    // Validate ingredients belong to user
    if (ingredients.length > 0) {
      const ingredientIds = ingredients.map((i) => i.ingredientId);
      const userIngredients = await prisma.ingredient.findMany({
        where: {
          id: { in: ingredientIds },
          userId: session.user.id as string,
        },
      });

      if (userIngredients.length !== ingredientIds.length) {
        return { success: false, error: "Some ingredients are invalid" };
      }
    }

    // Delete existing ingredients and create new ones
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id },
    });

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name: name.trim(),
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
      },
    });

    return { success: true, data: { id: recipe.id, name: recipe.name } };
  } catch (error) {
    console.error("Update recipe error:", error);
    return { success: false, error: "Failed to update recipe" };
  }
}

export async function deleteRecipeAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    // Recipe deletion will cascade delete RecipeIngredient records
    await prisma.recipe.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete recipe error:", error);
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return { success: false, error: "Recipe not found or already deleted" };
      }
      
      if (prismaError.code === 'P2003') {
        return { 
          success: false, 
          error: "Cannot delete recipe due to database constraints" 
        };
      }
    }
    
    // Handle generic errors with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to delete recipe: ${errorMessage}` 
    };
  }
}

export async function getRecipesAction() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const recipes = await prisma.recipe.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return recipes;
  } catch (error) {
    console.error("Get recipes error:", error);
    return [];
  }
}

export async function getRecipeAction(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return recipe;
  } catch (error) {
    console.error("Get recipe error:", error);
    return null;
  }
}
