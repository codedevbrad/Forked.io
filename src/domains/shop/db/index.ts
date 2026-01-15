"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Unit } from "@prisma/client";

export type ShoppingListIngredientInput = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
};

export async function createShoppingListAction(
  name: string,
  ingredients: ShoppingListIngredientInput[] = []
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

    const shoppingList = await prisma.shoppingList.create({
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

    return { success: true, data: { id: shoppingList.id, name: shoppingList.name } };
  } catch (error) {
    console.error("Create shopping list error:", error);
    return { success: false, error: "Failed to create shopping list" };
  }
}

export async function updateShoppingListAction(
  id: string,
  name: string,
  ingredients: ShoppingListIngredientInput[] = []
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
      where: {
        id,
        userId: session.user.id as string,
      },
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
    await prisma.shoppingListIngredient.deleteMany({
      where: { shoppingListId: id },
    });

    const shoppingList = await prisma.shoppingList.update({
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

    return shoppingList;
  } catch (error) {
    console.error("Get shopping list error:", error);
    return null;
  }
}
