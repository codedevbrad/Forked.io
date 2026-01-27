"use server";

import { prisma } from "@/src/lib/db";
import { ActionResult } from "@/src/domains/user/db";
import { DiscoverType } from "@prisma/client";

// DiscoverVideo Actions
export async function getDiscoverVideosAction() {
  try {
    const videos = await prisma.discoverVideo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return videos;
  } catch (error) {
    console.error("Get discover videos error:", error);
    return [];
  }
}

export async function getDiscoverVideoAction(id: string) {
  try {
    const video = await prisma.discoverVideo.findUnique({
      where: { id },
    });

    return video;
  } catch (error) {
    console.error("Get discover video error:", error);
    return null;
  }
}

export async function createDiscoverVideoAction(
  name: string,
  description: string,
  url: string,
  type: DiscoverType
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Video name is required" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "Video URL is required" };
    }

    const video = await prisma.discoverVideo.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        type,
      },
    });

    return { success: true, data: { id: video.id, name: video.name } };
  } catch (error) {
    console.error("Create discover video error:", error);
    return { success: false, error: "Failed to create video" };
  }
}

export async function updateDiscoverVideoAction(
  id: string,
  name: string,
  description: string,
  url: string,
  type: DiscoverType
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Video name is required" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "Video URL is required" };
    }

    const video = await prisma.discoverVideo.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        type,
      },
    });

    return { success: true, data: { id: video.id, name: video.name } };
  } catch (error) {
    console.error("Update discover video error:", error);
    return { success: false, error: "Failed to update video" };
  }
}

export async function deleteDiscoverVideoAction(id: string): Promise<ActionResult> {
  try {
    await prisma.discoverVideo.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete discover video error:", error);
    return { success: false, error: "Failed to delete video" };
  }
}

// RecipeWebsites Actions
export async function getRecipeWebsitesAction() {
  try {
    const websites = await prisma.recipeWebsites.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return websites;
  } catch (error) {
    console.error("Get recipe websites error:", error);
    return [];
  }
}

export async function getRecipeWebsiteAction(id: string) {
  try {
    const website = await prisma.recipeWebsites.findUnique({
      where: { id },
    });

    return website;
  } catch (error) {
    console.error("Get recipe website error:", error);
    return null;
  }
}

export async function createRecipeWebsiteAction(
  name: string,
  url: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Website name is required" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "Website URL is required" };
    }

    const website = await prisma.recipeWebsites.create({
      data: {
        name: name.trim(),
        url: url.trim(),
      },
    });

    return { success: true, data: { id: website.id, name: website.name } };
  } catch (error) {
    console.error("Create recipe website error:", error);
    return { success: false, error: "Failed to create recipe website" };
  }
}

export async function updateRecipeWebsiteAction(
  id: string,
  name: string,
  url: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Website name is required" };
    }

    if (!url || url.trim().length === 0) {
      return { success: false, error: "Website URL is required" };
    }

    const website = await prisma.recipeWebsites.update({
      where: { id },
      data: {
        name: name.trim(),
        url: url.trim(),
      },
    });

    return { success: true, data: { id: website.id, name: website.name } };
  } catch (error) {
    console.error("Update recipe website error:", error);
    return { success: false, error: "Failed to update recipe website" };
  }
}

export async function deleteRecipeWebsiteAction(id: string): Promise<ActionResult> {
  try {
    await prisma.recipeWebsites.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete recipe website error:", error);
    return { success: false, error: "Failed to delete recipe website" };
  }
}
