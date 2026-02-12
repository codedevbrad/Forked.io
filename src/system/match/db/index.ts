"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { scrapeProducts } from "@/src/domains/products/_fetch/products";
import { filterValidProducts } from "@/src/domains/products/_fetch/analyse";
import { Retailer } from "@prisma/client";

export type MatchableIngredient = {
  id: string;
  name: string;
  type: string;
  categoryName: string | null;
  productCount: number;
};

/**
 * Get ShopIngredients eligible for product matching.
 * Optionally filter by category and skip ingredients that already have products.
 */
export async function getMatchableIngredientsAction(
  categoryId?: string | null,
  skipWithProducts?: boolean
): Promise<MatchableIngredient[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const shopIngredients = await prisma.shopIngredient.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: { select: { name: true } },
        _count: { select: { shopProducts: true } },
      },
      orderBy: { name: "asc" },
    });

    const rows: MatchableIngredient[] = shopIngredients.map((si) => ({
      id: si.id,
      name: si.name,
      type: si.type,
      categoryName: si.category?.name ?? null,
      productCount: si._count.shopProducts,
    }));

    if (skipWithProducts) {
      return rows.filter((r) => r.productCount === 0);
    }

    return rows;
  } catch (error) {
    console.error("Get matchable ingredients error:", error);
    return [];
  }
}

export type MatchResult = {
  savedCount: number;
  existingCount: number;
  ingredientName: string;
};

/**
 * Scrape products for a single ShopIngredient and save the top N as linked ShopProducts.
 * Skips products that already exist (matched by productName + retailer).
 */
export async function matchProductsForIngredientAction(
  ingredientId: string,
  retailer: Retailer,
  maxProducts: number
): Promise<ActionResult<MatchResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ingredient = await prisma.shopIngredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return { success: false, error: "Ingredient not found" };
    }

    // Scrape products using the ingredient name as the search term
    const scraped = await scrapeProducts(retailer, ingredient.name);
    const filtered = await filterValidProducts(scraped, ingredient.name);

    // Take the top N products
    const candidates = filtered.slice(0, maxProducts);

    if (candidates.length === 0) {
      return {
        success: true,
        data: { savedCount: 0, existingCount: 0, ingredientName: ingredient.name },
      };
    }

    // Check which products already exist (by productName + retailer)
    const candidateNames = candidates.map((p) => p.productName);
    const existing = await prisma.shopProduct.findMany({
      where: {
        retailer,
        productName: { in: candidateNames },
      },
      select: { productName: true },
    });

    const existingNames = new Set(
      existing.map((e) => e.productName.toLowerCase())
    );

    const newProducts = candidates.filter(
      (p) => !existingNames.has(p.productName.toLowerCase())
    );
    const existingCount = candidates.length - newProducts.length;

    if (newProducts.length === 0) {
      return {
        success: true,
        data: { savedCount: 0, existingCount, ingredientName: ingredient.name },
      };
    }

    // Create only the new ShopProduct records linked to the ShopIngredient
    const created = await prisma.shopProduct.createMany({
      data: newProducts.map((p) => ({
        retailer: p.retailer,
        productName: p.productName,
        url: p.url,
        size: p.size,
        unit: p.unit,
        imageUrl: p.imageUrl,
        shopIngredientId: ingredientId,
      })),
    });

    return {
      success: true,
      data: {
        savedCount: created.count,
        existingCount,
        ingredientName: ingredient.name,
      },
    };
  } catch (error) {
    console.error("Match products for ingredient error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to match products",
    };
  }
}
