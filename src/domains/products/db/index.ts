"use server";

import { prisma } from "@/src/lib/db";
import { auth } from "@/auth";
import { ActionResult } from "@/src/domains/user/db";
import { Retailer, Unit } from "@prisma/client";

export async function getProductsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const products = await prisma.shopProduct.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getProductAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const product = await prisma.shopProduct.findFirst({
      where: {
        id,
        userId: session.user.id as string,
      },
    });
    return product;
  } catch (error) {
    console.error("Get product error:", error);
    return null;
  }
}

export async function createProductAction(
  retailer: Retailer,
  productName: string,
  url?: string | null,
  price?: string | number | null,
  size?: number | null,
  unit?: Unit | null,
  imageUrl?: string | null
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId || typeof userId !== "string") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return {
        success: false,
        error: "User not found. Please sign out and sign in again.",
      };
    }

    if (!productName?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    const priceInt =
      price != null && price !== "" && !Number.isNaN(Number(price))
        ? Math.round(Number(price) * 100)
        : undefined;

    const product = await prisma.shopProduct.create({
      data: {
        retailer,
        productName: productName.trim(),
        userId: user.id,
        url: url?.trim() || null,
        price: priceInt ?? null,
        size: size ?? null,
        unit: unit ?? null,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return { success: true, data: { id: product.id } };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProductAction(
  id: string,
  retailer: Retailer,
  productName: string,
  url?: string | null,
  price?: string | number | null,
  size?: number | null,
  unit?: Unit | null,
  imageUrl?: string | null
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!productName?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    const existing = await prisma.shopProduct.findFirst({
      where: { id, userId: session.user.id as string },
    });
    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    const priceInt =
      price != null && price !== "" && !Number.isNaN(Number(price))
        ? Math.round(Number(price) * 100)
        : null;

    await prisma.shopProduct.update({
      where: { id },
      data: {
        retailer,
        productName: productName.trim(),
        url: url?.trim() || null,
        price: priceInt,
        size: size ?? null,
        unit: unit ?? null,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const product = await prisma.shopProduct.findFirst({
      where: { id, userId: session.user.id as string },
    });
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await prisma.shopProduct.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        return { success: false, error: "Product not found or already deleted" };
      }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}
