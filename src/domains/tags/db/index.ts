"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";

export async function createTagAction(
  name: string,
  color: string = "#3b82f6"
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Tag name is required" };
    }

    // Check if tag already exists for this user
    const existing = await prisma.tag.findFirst({
      where: {
        userId: session.user.id as string,
        name: name.trim(),
      },
    });

    if (existing) {
      return { success: false, error: "Tag already exists" };
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color.trim(),
        userId: session.user.id as string,
      },
    });

    return { success: true, data: { id: tag.id, name: tag.name, color: tag.color } };
  } catch (error) {
    console.error("Create tag error:", error);
    return { success: false, error: "Failed to create tag" };
  }
}

export async function getTagsAction() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        name: "asc",
      },
    });

    return tags;
  } catch (error) {
    console.error("Get tags error:", error);
    return [];
  }
}

export async function updateTagAction(
  tagId: string,
  name: string,
  color: string
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Tag name is required" };
    }

    // Check if tag exists and belongs to user
    const existing = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id as string,
      },
    });

    if (!existing) {
      return { success: false, error: "Tag not found" };
    }

    // Check if another tag with the same name exists
    const duplicate = await prisma.tag.findFirst({
      where: {
        userId: session.user.id as string,
        name: name.trim(),
        id: { not: tagId },
      },
    });

    if (duplicate) {
      return { success: false, error: "Tag name already exists" };
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: name.trim(),
        color: color.trim(),
      },
    });

    return { success: true, data: { id: tag.id, name: tag.name, color: tag.color } };
  } catch (error) {
    console.error("Update tag error:", error);
    return { success: false, error: "Failed to update tag" };
  }
}

export async function deleteTagAction(
  tagId: string
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if tag exists and belongs to user
    const existing = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id as string,
      },
      include: {
        ingredients: true,
      },
    });

    if (!existing) {
      return { success: false, error: "Tag not found" };
    }

    // Delete the tag - Prisma will automatically disconnect many-to-many relationships
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete tag error:", error);
    return { success: false, error: "Failed to delete tag" };
  }
}
