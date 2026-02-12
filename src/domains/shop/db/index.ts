"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Unit } from "@prisma/client";

export type ShoppingListIngredientInput = {
  ingredientId?: string;
  shopIngredientId?: string;
  quantity: number;
  unit: Unit;
};

// Shared include for shopping list queries
const shoppingListInclude = {
  ingredients: {
    include: {
      ingredient: { include: { shopIngredient: true, customUserIngredient: true } },
      shopIngredient: true,
      recipe: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  recipes: {
    include: {
      recipe: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

/**
 * Validate and split ingredient inputs into user-owned and shop ingredients.
 * Returns an error string if validation fails, or the validated data.
 */
async function validateIngredients(
  ingredients: ShoppingListIngredientInput[],
  userId: string
): Promise<
  | { success: true; userIngredientInputs: ShoppingListIngredientInput[]; shopIngredientInputs: ShoppingListIngredientInput[] }
  | { success: false; error: string }
> {
  const userIngredientInputs = ingredients.filter((i) => i.ingredientId);
  const shopIngredientInputs = ingredients.filter((i) => i.shopIngredientId);

  // Ensure each input has exactly one source
  const invalid = ingredients.some((i) => {
    const hasUser = !!i.ingredientId;
    const hasShop = !!i.shopIngredientId;
    return hasUser === hasShop; // both set or neither set
  });
  if (invalid) {
    return { success: false, error: "Each ingredient must specify either ingredientId or shopIngredientId" };
  }

  // Validate user ingredients belong to user
  if (userIngredientInputs.length > 0) {
    const ids = userIngredientInputs.map((i) => i.ingredientId!);
    const found = await prisma.ingredient.findMany({
      where: { id: { in: ids }, userId },
    });
    if (found.length !== ids.length) {
      return { success: false, error: "Some ingredients are invalid" };
    }
  }

  // Validate shop ingredients exist
  if (shopIngredientInputs.length > 0) {
    const ids = shopIngredientInputs.map((i) => i.shopIngredientId!);
    const found = await prisma.shopIngredient.findMany({
      where: { id: { in: ids } },
    });
    if (found.length !== ids.length) {
      return { success: false, error: "Some shop ingredients are invalid" };
    }
  }

  return { success: true, userIngredientInputs, shopIngredientInputs };
}

/**
 * Build a recipe→ingredient map to track which recipe a shopping list ingredient came from.
 */
function buildRecipeMap(
  ingredients: ShoppingListIngredientInput[],
  userRecipes: Array<{ id: string; ingredients: Array<{ ingredientId: string; unit: Unit }> }>
): Map<string, string> {
  const map = new Map<string, string>();
  userRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((recipeIng) => {
      const match = ingredients.find(
        (ing) => ing.ingredientId === recipeIng.ingredientId && ing.unit === recipeIng.unit
      );
      if (match) {
        map.set(`${match.ingredientId}-${match.unit}`, recipe.id);
      }
    });
  });
  return map;
}

/**
 * Map ingredient inputs to Prisma createMany data.
 */
function toCreateData(
  ingredients: ShoppingListIngredientInput[],
  shoppingListId: string,
  ingredientRecipeMap: Map<string, string>
) {
  return ingredients.map((ing) => {
    const recipeId = ing.ingredientId
      ? ingredientRecipeMap.get(`${ing.ingredientId}-${ing.unit}`)
      : undefined;

    return {
      shoppingListId,
      ...(ing.ingredientId ? { ingredientId: ing.ingredientId } : {}),
      ...(ing.shopIngredientId ? { shopIngredientId: ing.shopIngredientId } : {}),
      quantity: ing.quantity,
      unit: ing.unit,
      ...(recipeId ? { recipeId } : {}),
    };
  });
}

export async function createShoppingListAction(
  name: string,
  ingredients: ShoppingListIngredientInput[] = [],
  recipeIds: string[] = []
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Shopping list name is required" };
    }

    // Check if shopping list already exists for this user
    const existing = await prisma.shoppingList.findUnique({
      where: {
        userId_name: {
          userId: session.user.id as string,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return { success: false, error: "Shopping list with this name already exists" };
    }

    // Validate ingredients
    if (ingredients.length > 0) {
      const validation = await validateIngredients(ingredients, session.user.id as string);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
    }

    // Validate recipes belong to user and get their ingredients
    let userRecipes: Array<{
      id: string;
      ingredients: Array<{ ingredientId: string; unit: Unit }>;
    }> = [];
    
    if (recipeIds.length > 0) {
      userRecipes = await prisma.recipe.findMany({
        where: {
          id: { in: recipeIds },
          userId: session.user.id as string,
        },
        include: { ingredients: true },
      });

      if (userRecipes.length !== recipeIds.length) {
        return { success: false, error: "Some recipes are invalid" };
      }
    }

    const ingredientRecipeMap = buildRecipeMap(ingredients, userRecipes);

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: name.trim(),
        userId: session.user.id as string,
        recipes: {
          create: recipeIds.map((recipeId) => ({ recipeId })),
        },
      },
    });

    // Create ingredients
    if (ingredients.length > 0) {
      await prisma.shoppingListIngredient.createMany({
        data: toCreateData(ingredients, shoppingList.id, ingredientRecipeMap),
      });
    }

    return { success: true, data: { id: shoppingList.id, name: shoppingList.name } };
  } catch (error) {
    console.error("Create shopping list error:", error);
    return { success: false, error: "Failed to create shopping list" };
  }
}

export async function updateShoppingListAction(
  id: string,
  name: string,
  ingredients: ShoppingListIngredientInput[] = [],
  recipeIds: string[] = []
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Shopping list name is required" };
    }

    // Verify ownership
    const existing = await prisma.shoppingList.findFirst({
      where: { id, userId: session.user.id as string },
    });

    if (!existing) {
      return { success: false, error: "Shopping list not found" };
    }

    // Check if new name conflicts with another shopping list
    const nameConflict = await prisma.shoppingList.findUnique({
      where: {
        userId_name: {
          userId: session.user.id as string,
          name: name.trim(),
        },
      },
    });

    if (nameConflict && nameConflict.id !== id) {
      return { success: false, error: "A shopping list with this name already exists" };
    }

    // Validate ingredients
    if (ingredients.length > 0) {
      const validation = await validateIngredients(ingredients, session.user.id as string);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
    }

    // Validate recipes belong to user
    let userRecipes: Array<{
      id: string;
      ingredients: Array<{ ingredientId: string; unit: Unit }>;
    }> = [];
    
    if (recipeIds.length > 0) {
      userRecipes = await prisma.recipe.findMany({
        where: {
          id: { in: recipeIds },
          userId: session.user.id as string,
        },
        include: { ingredients: true },
      });

      if (userRecipes.length !== recipeIds.length) {
        return { success: false, error: "Some recipes are invalid" };
      }
    }

    const ingredientRecipeMap = buildRecipeMap(ingredients, userRecipes);

    // Delete existing ingredients and recipes, then create new ones
    await prisma.shoppingListIngredient.deleteMany({ where: { shoppingListId: id } });
    await prisma.shoppingListRecipe.deleteMany({ where: { shoppingListId: id } });

    // Update shopping list name and recipes
    const shoppingList = await prisma.shoppingList.update({
      where: { id },
      data: {
        name: name.trim(),
        recipes: {
          create: recipeIds.map((recipeId) => ({ recipeId })),
        },
      },
    });

    // Create ingredients
    if (ingredients.length > 0) {
      await prisma.shoppingListIngredient.createMany({
        data: toCreateData(ingredients, id, ingredientRecipeMap),
      });
    }

    return { success: true, data: { id: shoppingList.id, name: shoppingList.name } };
  } catch (error) {
    console.error("Update shopping list error:", error);
    return { success: false, error: "Failed to update shopping list" };
  }
}

export async function deleteShoppingListAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!shoppingList) {
      return { success: false, error: "Shopping list not found" };
    }

    // Shopping list deletion will cascade delete ShoppingListIngredient records
    await prisma.shoppingList.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete shopping list error:", error);
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return { success: false, error: "Shopping list not found or already deleted" };
      }
      
      if (prismaError.code === 'P2003') {
        return { 
          success: false, 
          error: "Cannot delete shopping list due to database constraints" 
        };
      }
    }
    
    // Handle generic errors with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to delete shopping list: ${errorMessage}` 
    };
  }
}

export async function getShoppingListsAction() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId: session.user.id as string },
      include: shoppingListInclude,
      orderBy: { createdAt: "desc" },
    });

    return shoppingLists;
  } catch (error) {
    console.error("Get shopping lists error:", error);
    return [];
  }
}

export async function getShoppingListAction(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { id, userId: session.user.id as string },
      include: shoppingListInclude,
    });

    return shoppingList;
  } catch (error) {
    console.error("Get shopping list error:", error);
    return null;
  }
}

/** Fetch all ShopIngredients for the ingredient picker, including category for filtering. */
export async function getShopIngredientsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.shopIngredient.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        categoryId: true,
        category: { select: { id: true, name: true, color: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Get shop ingredients error:", error);
    return [];
  }
}

/** Fetch all categories (for the ingredient picker filter). */
export async function getCategoriesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.category.findMany({
      select: { id: true, name: true, color: true, icon: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return [];
  }
}
