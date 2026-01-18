"use server";

import { prisma } from "@/src/lib/db";

export async function getCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Get categories error:", error);
    return [];
  }
}

export async function getCategoryAction(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  } catch (error) {
    console.error("Get category error:", error);
    return null;
  }
}
