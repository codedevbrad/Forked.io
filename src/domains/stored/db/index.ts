"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { StorageType, Unit } from "@prisma/client";

export async function createStoredAction(
  name: string,
  type: StorageType
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Storage name is required" };
    }

    const stored = await prisma.stored.create({
      data: {
        name: name.trim(),
        type,
        userId: session.user.id as string,
      },
    });

    return { success: true, data: { id: stored.id, name: stored.name } };
  } catch (error) {
    console.error("Create stored error:", error);
    return { success: false, error: "Failed to create storage location" };
  }
}

export async function updateStoredAction(
  id: string,
  name: string,
  type: StorageType
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Storage name is required" };
    }

    // Verify ownership
    const existing = await prisma.stored.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Storage location not found" };
    }

    const stored = await prisma.stored.update({
      where: { id },
      data: {
        name: name.trim(),
        type,
      },
    });

    return { success: true, data: { id: stored.id, name: stored.name } };
  } catch (error) {
    console.error("Update stored error:", error);
    return { success: false, error: "Failed to update storage location" };
  }
}

export async function deleteStoredAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const stored = await prisma.stored.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });

    if (!stored) {
      return { success: false, error: "Storage location not found" };
    }

    // Stored deletion will cascade delete StoredIngredient records
    await prisma.stored.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete stored error:", error);
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return { success: false, error: "Storage location not found or already deleted" };
      }
      
      if (prismaError.code === 'P2003') {
        return { 
          success: false, 
          error: "Cannot delete storage location due to database constraints" 
        };
      }
    }
    
    // Handle generic errors with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to delete storage location: ${errorMessage}` 
    };
  }
}

export async function getStoredAction() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const stored = await prisma.stored.findMany({
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

    return stored;
  } catch (error) {
    console.error("Get stored error:", error);
    return [];
  }
}

export async function getStoredLocationAction(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const stored = await prisma.stored.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return stored;
  } catch (error) {
    console.error("Get stored location error:", error);
    return null;
  }
}

export async function addIngredientToStoredAction(
  storedId: string,
  ingredientId: string,
  quantity: number,
  unit: Unit,
  expiresAt?: Date | null,
  storeLink?: string | null
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify storage ownership
    const stored = await prisma.stored.findFirst({
      where: {
        id: storedId,
        userId: session.user.id as string,
      },
    });

    if (!stored) {
      return { success: false, error: "Storage location not found" };
    }

    // Verify ingredient ownership
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id: ingredientId,
        userId: session.user.id as string,
      },
    });

    if (!ingredient) {
      return { success: false, error: "Ingredient not found" };
    }

    // Check if ingredient already exists in this storage
    const existing = await prisma.storedIngredient.findUnique({
      where: {
        storedId_ingredientId: {
          storedId,
          ingredientId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Ingredient already exists in this storage location" };
    }

    if (quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    const storedIngredient = await prisma.storedIngredient.create({
      data: {
        storedId,
        ingredientId,
        quantity,
        unit,
        expiresAt: expiresAt || null,
        storeLink: storeLink || null,
      },
    });

    return { success: true, data: { id: storedIngredient.id } };
  } catch (error) {
    console.error("Add ingredient to stored error:", error);
    return { success: false, error: "Failed to add ingredient to storage" };
  }
}

export async function removeIngredientFromStoredAction(
  storedIngredientId: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership through the stored location
    const storedIngredient = await prisma.storedIngredient.findFirst({
      where: {
        id: storedIngredientId,
      },
      include: {
        stored: true,
      },
    });

    if (!storedIngredient) {
      return { success: false, error: "Stored ingredient not found" };
    }

    if (storedIngredient.stored.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.storedIngredient.delete({
      where: {
        id: storedIngredientId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Remove ingredient from stored error:", error);
    
    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2025') {
        return { success: false, error: "Stored ingredient not found or already removed" };
      }
      
      if (prismaError.code === 'P2003') {
        return { 
          success: false, 
          error: "Cannot remove ingredient due to database constraints" 
        };
      }
    }
    
    // Handle generic errors with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to remove ingredient from storage: ${errorMessage}` 
    };
  }
}

export async function updateStoredIngredientAction(
  storedIngredientId: string,
  quantity: number,
  unit: Unit,
  expiresAt?: Date | null,
  storeLink?: string | null
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership through the stored location
    const storedIngredient = await prisma.storedIngredient.findFirst({
      where: {
        id: storedIngredientId,
      },
      include: {
        stored: true,
      },
    });

    if (!storedIngredient) {
      return { success: false, error: "Stored ingredient not found" };
    }

    if (storedIngredient.stored.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    const updated = await prisma.storedIngredient.update({
      where: {
        id: storedIngredientId,
      },
      data: {
        quantity,
        unit,
        expiresAt: expiresAt || null,
        storeLink: storeLink || null,
      },
    });

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    console.error("Update stored ingredient error:", error);
    return { success: false, error: "Failed to update stored ingredient" };
  }
}
