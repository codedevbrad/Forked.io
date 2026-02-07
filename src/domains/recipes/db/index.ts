"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Unit, IngredientType } from "@prisma/client";
import { scrapeRecipeFromUrl } from "@/src/services/scraper";
import { extractRecipeData, type ExtractedIngredient } from "@/src/services/openai/ai.extractrecipe";
import { uploadRecipeImageToR2 } from "@/src/lib/cloudflare";

export type RecipeIngredientInput = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
};

export async function createRecipeAction(
  name: string,
  ingredients: RecipeIngredientInput[] = [],
  tagIds: string[] = []
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

    // Validate tags belong to user
    if (tagIds.length > 0) {
      const userTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: session.user.id as string,
        },
      });

      if (userTags.length !== tagIds.length) {
        return { success: false, error: "Some tags are invalid" };
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
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
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
  ingredients: RecipeIngredientInput[] = [],
  tagIds: string[] = []
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

    // Validate tags belong to user
    if (tagIds.length > 0) {
      const userTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: session.user.id as string,
        },
      });

      if (userTags.length !== tagIds.length) {
        return { success: false, error: "Some tags are invalid" };
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
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
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
      const prismaError = error as { code: string; meta?: unknown };
      
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
            ingredient: { include: { shopIngredient: true, customUserIngredient: true } },
          },
        },
        tags: true,
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
            ingredient: { include: { shopIngredient: true, customUserIngredient: true } },
          },
        },
        tags: true,
      },
    });

    return recipe;
  } catch (error) {
    console.error("Get recipe error:", error);
    return null;
  }
}

/**
 * Extracts recipe data from a URL without saving (for preview)
 */
export async function previewRecipeFromUrlAction(
  url: string
): Promise<ActionResult<{ name: string; ingredients: ExtractedIngredient[]; images: string[] }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "URL is required" };
    }

    // Step 1: Scrape the recipe from URL
    const scrapedData = await scrapeRecipeFromUrl(url.trim());

    // Step 2: Extract recipe data using OpenAI
    const extractedData = await extractRecipeData(scrapedData.text, scrapedData.images);

    if (!extractedData.name || extractedData.ingredients.length === 0) {
      return { 
        success: false, 
        error: "Could not extract recipe name or ingredients from the URL" 
      };
    }

    return { 
      success: true, 
      data: { 
        name: extractedData.name, 
        ingredients: extractedData.ingredients,
        images: extractedData.images || []
      } 
    };
  } catch (error) {
    console.error("Preview recipe from URL error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `Failed to preview recipe: ${errorMessage}` 
    };
  }
}

/**
 * Uploads an image from a URL to Cloudflare R2
 */
export async function uploadRecipeImageAction(
  imageUrl: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!imageUrl || imageUrl.trim().length === 0) {
      return { success: false, error: "Image URL is required" };
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!imageResponse.ok) {
      return { success: false, error: `Failed to fetch image: ${imageResponse.statusText}` };
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Determine content type from response or URL
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    
    // Extract filename from URL or use default
    const urlPath = new URL(imageUrl).pathname;
    const fileName = urlPath.split("/").pop() || "recipe-image.jpg";
    
    // Upload to R2 - using recipes folder structure
    const uploadResult = await uploadRecipeImageToR2(
      imageBuffer,
      fileName,
      contentType
    );

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    return { success: true, data: { url: uploadResult.url } };
  } catch (error) {
    console.error("Upload recipe image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `Failed to upload image: ${errorMessage}` 
    };
  }
}

/**
 * Saves a previewed recipe to the database.
 * Matches scraped ingredients to existing ShopIngredient by name (case-insensitive).
 * Unmatched names are linked to a CustomUserIngredient (find-or-create).
 */
export async function savePreviewedRecipeAction(
  name: string,
  ingredients: ExtractedIngredient[],
  originalUrl: string,
  imageUrl?: string
): Promise<ActionResult<{ id: string; name: string; matchedIngredientNames: string[]; existingCustomIngredientNames: string[]; newCustomIngredientNames: string[] }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Recipe name is required" };
    }

    if (!ingredients || ingredients.length === 0) {
      return { success: false, error: "At least one ingredient is required" };
    }

    const recipeIngredientsMap = new Map<string, RecipeIngredientInput>();
    const matchedIngredientNames: string[] = [];
    const existingCustomIngredientNames: string[] = [];
    const newCustomIngredientNames: string[] = [];
    const userId = session.user.id as string;

    // Pre-fetch user's existing CustomUserIngredients to avoid N+1 queries
    const existingCustomUserIngredients = await prisma.customUserIngredient.findMany({
      where: { userId },
    });
    // Snapshot the IDs that existed before this import so we can distinguish existing vs new
    const preExistingCustomIds = new Set(existingCustomUserIngredients.map((c) => c.id));

    for (const extractedIng of ingredients) {
      const trimmedName = extractedIng.name.trim();

      // Try to find existing ShopIngredient by name (case-insensitive)
      const shopIngredient = await prisma.shopIngredient.findFirst({
        where: { name: { equals: trimmedName, mode: "insensitive" } },
      });

      let ingredient: { id: string };

      if (shopIngredient) {
        // Match found: find or create user's Ingredient for this ShopIngredient
        let userIngredient = await prisma.ingredient.findFirst({
          where: { userId, shopIngredientId: shopIngredient.id },
        });
        if (!userIngredient) {
          userIngredient = await prisma.ingredient.create({
            data: {
              userId,
              shopIngredientId: shopIngredient.id,
            },
          });
        }
        ingredient = userIngredient;
        if (!matchedIngredientNames.includes(shopIngredient.name)) {
          matchedIngredientNames.push(shopIngredient.name);
        }
      } else {
        // No ShopIngredient match — find or create a CustomUserIngredient
        let customUserIng = existingCustomUserIngredients.find(
          (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
        );

        const wasPreExisting = customUserIng ? preExistingCustomIds.has(customUserIng.id) : false;

        if (!customUserIng) {
          customUserIng = await prisma.customUserIngredient.create({
            data: {
              userId,
              name: trimmedName,
              type: IngredientType.food,
            },
          });
          // Cache so later iterations in this loop can find it
          existingCustomUserIngredients.push(customUserIng);
        }

        // Find or create user's Ingredient linked to this CustomUserIngredient
        let userIngredient = await prisma.ingredient.findFirst({
          where: { userId, customUserIngredientId: customUserIng.id },
        });
        if (!userIngredient) {
          userIngredient = await prisma.ingredient.create({
            data: {
              userId,
              customUserIngredientId: customUserIng.id,
            },
          });
        }
        ingredient = userIngredient;

        if (wasPreExisting) {
          if (!existingCustomIngredientNames.includes(trimmedName)) {
            existingCustomIngredientNames.push(trimmedName);
          }
        } else {
          if (!newCustomIngredientNames.includes(trimmedName)) {
            newCustomIngredientNames.push(trimmedName);
          }
        }
      }

      const existing = recipeIngredientsMap.get(ingredient.id);
      if (existing) {
        if (existing.unit === extractedIng.unit) {
          existing.quantity += extractedIng.quantity;
        }
      } else {
        recipeIngredientsMap.set(ingredient.id, {
          ingredientId: ingredient.id,
          quantity: extractedIng.quantity,
          unit: extractedIng.unit,
        });
      }
    }

    const recipeIngredients = Array.from(recipeIngredientsMap.values());

    const recipe = await prisma.recipe.create({
      data: {
        name: name.trim(),
        originalUrl: originalUrl.trim(),
        image: imageUrl || "https://via.placeholder.com/150",
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

    return {
      success: true,
      data: {
        id: recipe.id,
        name: recipe.name,
        matchedIngredientNames,
        existingCustomIngredientNames,
        newCustomIngredientNames,
      },
    };
  } catch (error) {
    console.error("Save previewed recipe error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `Failed to save recipe: ${errorMessage}` 
    };
  }
}

/**
 * Imports a recipe from a URL by scraping it and extracting ingredients with OpenAI
 * @deprecated Use previewRecipeFromUrlAction + savePreviewedRecipeAction instead
 */
export async function importRecipeFromUrlAction(
  url: string
): Promise<ActionResult<{ id: string; name: string; matchedIngredientNames: string[]; customIngredientNames: string[] }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "URL is required" };
    }

    const scrapedData = await scrapeRecipeFromUrl(url.trim());
    const extractedData = await extractRecipeData(scrapedData.text, scrapedData.images);

    if (!extractedData.name || extractedData.ingredients.length === 0) {
      return { 
        success: false, 
        error: "Could not extract recipe name or ingredients from the URL" 
      };
    }

    const recipeIngredientsMap = new Map<string, RecipeIngredientInput>();
    const matchedIngredientNames: string[] = [];
    const customIngredientNames: string[] = [];
    const userId = session.user.id as string;

    // Pre-fetch user's existing CustomUserIngredients to avoid N+1 queries
    const existingCustomUserIngredients = await prisma.customUserIngredient.findMany({
      where: { userId },
    });

    for (const extractedIng of extractedData.ingredients) {
      const trimmedName = extractedIng.name.trim();
      const shopIngredient = await prisma.shopIngredient.findFirst({
        where: { name: { equals: trimmedName, mode: "insensitive" } },
      });

      let ingredient: { id: string };

      if (shopIngredient) {
        let userIngredient = await prisma.ingredient.findFirst({
          where: { userId, shopIngredientId: shopIngredient.id },
        });
        if (!userIngredient) {
          userIngredient = await prisma.ingredient.create({
            data: {
              userId,
              shopIngredientId: shopIngredient.id,
            },
          });
        }
        ingredient = userIngredient;
        if (!matchedIngredientNames.includes(shopIngredient.name)) {
          matchedIngredientNames.push(shopIngredient.name);
        }
      } else {
        // No ShopIngredient match — find or create a CustomUserIngredient
        let customUserIng = existingCustomUserIngredients.find(
          (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (!customUserIng) {
          customUserIng = await prisma.customUserIngredient.create({
            data: {
              userId,
              name: trimmedName,
              type: IngredientType.food,
            },
          });
          existingCustomUserIngredients.push(customUserIng);
        }

        // Find or create user's Ingredient linked to this CustomUserIngredient
        let userIngredient = await prisma.ingredient.findFirst({
          where: { userId, customUserIngredientId: customUserIng.id },
        });
        if (!userIngredient) {
          userIngredient = await prisma.ingredient.create({
            data: {
              userId,
              customUserIngredientId: customUserIng.id,
            },
          });
        }
        ingredient = userIngredient;

        if (!customIngredientNames.includes(trimmedName)) {
          customIngredientNames.push(trimmedName);
        }
      }

      const existing = recipeIngredientsMap.get(ingredient.id);
      if (existing) {
        if (existing.unit === extractedIng.unit) {
          existing.quantity += extractedIng.quantity;
        }
      } else {
        recipeIngredientsMap.set(ingredient.id, {
          ingredientId: ingredient.id,
          quantity: extractedIng.quantity,
          unit: extractedIng.unit,
        });
      }
    }

    const recipeIngredients = Array.from(recipeIngredientsMap.values());

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

    return {
      success: true,
      data: {
        id: recipe.id,
        name: recipe.name,
        matchedIngredientNames,
        customIngredientNames,
      },
    };
  } catch (error) {
    console.error("Import recipe from URL error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `Failed to import recipe: ${errorMessage}` 
    };
  }
}
