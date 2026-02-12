"use server";

import { prisma } from "@/src/lib/db";

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
