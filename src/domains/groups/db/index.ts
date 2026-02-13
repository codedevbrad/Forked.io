"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";

export type GroupWithIngredients = {
  id: string;
  name: string;
  userId: string;
  ingredients: Array<{
    id: string;
    shopIngredientId?: string | null;
    shopIngredient?: {
      name: string;
      category: { id: string; name: string; color: string; icon?: string | null } | null;
    } | null;
    customUserIngredient?: {
      name: string;
      category: { id: string; name: string; color: string; icon?: string | null } | null;
    } | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export async function createGroupAction(
  name: string,
  ingredientIds?: string[]
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Group name is required" };
    }

    // Check if group already exists for this user (unique constraint: userId + name)
    const existing = await prisma.userGroupedIngredients.findFirst({
      where: {
        userId: session.user.id as string,
        name: name.trim(),
      },
    });

    if (existing) {
      return { success: false, error: "A group with this name already exists" };
    }

    // Verify ingredient ownership if ingredientIds provided
    if (ingredientIds && ingredientIds.length > 0) {
      const ingredients = await prisma.ingredient.findMany({
        where: {
          id: { in: ingredientIds },
          userId: session.user.id as string,
        },
      });

      if (ingredients.length !== ingredientIds.length) {
        return { success: false, error: "One or more ingredients not found or unauthorized" };
      }
    }

    const group = await prisma.userGroupedIngredients.create({
      data: {
        name: name.trim(),
        userId: session.user.id as string,
        ingredients:
          ingredientIds && ingredientIds.length > 0
            ? { connect: ingredientIds.map((id) => ({ id })) }
            : undefined,
      },
    });

    return { success: true, data: { id: group.id, name: group.name } };
  } catch (error) {
    console.error("Create group error:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function updateGroupAction(
  groupId: string,
  name: string,
  ingredientIds?: string[]
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Group name is required" };
    }

    // Check if group exists and belongs to user
    const existing = await prisma.userGroupedIngredients.findFirst({
      where: {
        id: groupId,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Group not found" };
    }

    // Check if another group with the same name exists
    const duplicate = await prisma.userGroupedIngredients.findFirst({
      where: {
        userId: session.user.id as string,
        name: name.trim(),
        id: { not: groupId },
      },
    });

    if (duplicate) {
      return { success: false, error: "A group with this name already exists" };
    }

    // Verify ingredient ownership if ingredientIds provided
    if (ingredientIds && ingredientIds.length > 0) {
      const ingredients = await prisma.ingredient.findMany({
        where: {
          id: { in: ingredientIds },
          userId: session.user.id as string,
        },
      });

      if (ingredients.length !== ingredientIds.length) {
        return { success: false, error: "One or more ingredients not found or unauthorized" };
      }
    }

    const group = await prisma.userGroupedIngredients.update({
      where: { id: groupId },
      data: {
        name: name.trim(),
        ingredients: {
          set: ingredientIds ? ingredientIds.map((id) => ({ id })) : [],
        },
      },
    });

    return { success: true, data: { id: group.id, name: group.name } };
  } catch (error) {
    console.error("Update group error:", error);
    return { success: false, error: "Failed to update group" };
  }
}

export async function deleteGroupAction(
  groupId: string
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if group exists and belongs to user
    const existing = await prisma.userGroupedIngredients.findFirst({
      where: {
        id: groupId,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Group not found" };
    }

    // Delete the group (many-to-many relations are auto-disconnected)
    await prisma.userGroupedIngredients.delete({
      where: { id: groupId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete group error:", error);
    return { success: false, error: "Failed to delete group" };
  }
}

export async function getGroupsAction(): Promise<GroupWithIngredients[]> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return [];
    }

    const groups = await prisma.userGroupedIngredients.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        ingredients: {
          include: {
            shopIngredient: { include: { category: true } },
            customUserIngredient: { include: { category: true } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return groups;
  } catch (error) {
    console.error("Get groups error:", error);
    return [];
  }
}

export async function getGroupAction(
  groupId: string
): Promise<GroupWithIngredients | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const group = await prisma.userGroupedIngredients.findFirst({
      where: {
        id: groupId,
        userId: session.user.id as string,
      },
      include: {
        ingredients: {
          include: {
            shopIngredient: { include: { category: true } },
            customUserIngredient: { include: { category: true } },
          },
        },
      },
    });

    return group;
  } catch (error) {
    console.error("Get group error:", error);
    return null;
  }
}
