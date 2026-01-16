"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Unit, IngredientType } from "@prisma/client";
import { scrapeRecipeFromUrl } from "@/src/services/scraper";
import { extractRecipeData } from "@/src/services/openai";

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

/**
 * Imports a recipe from a URL by scraping it and extracting ingredients with OpenAI
 */
export async function importRecipeFromUrlAction(
  url: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "URL is required" };
    }

    // Step 1: Scrape the recipe from URL
    const scrapedContent = await scrapeRecipeFromUrl(url.trim());

    // Step 2: Extract recipe data using OpenAI
    const extractedData = await extractRecipeData(scrapedContent);

    if (!extractedData.name || extractedData.ingredients.length === 0) {
      return { 
        success: false, 
        error: "Could not extract recipe name or ingredients from the URL" 
      };
    }

    // Step 3: Create or find ingredients and build recipe ingredient inputs
    const recipeIngredients: RecipeIngredientInput[] = [];
    const userId = session.user.id as string;

    for (const extractedIng of extractedData.ingredients) {
      // Try to find existing ingredient
      let ingredient = await prisma.ingredient.findUnique({
        where: {
          userId_name: {
            userId,
            name: extractedIng.name,
          },
        },
      });

      // If not found, create it (default to "food" type)
      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: {
            name: extractedIng.name,
            type: IngredientType.food,
            userId,
          },
        });
      }

      recipeIngredients.push({
        ingredientId: ingredient.id,
        quantity: extractedIng.quantity,
        unit: extractedIng.unit,
      });
    }

    // Step 4: Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        name: extractedData.name,
        originalUrl: url.trim(),
        userId,
        ingredients: {
          create: recipeIngredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
      },
    });

    return { success: true, data: { id: recipe.id, name: recipe.name } };
  } catch (error) {
    console.error("Import recipe from URL error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `Failed to import recipe: ${errorMessage}` 
    };
  }
}
