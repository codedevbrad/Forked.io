"use client";

import useSWR from "swr";
import { getShopIngredientsAction } from "@/src/domains/shop/db";

export type ShopIngredientOption = Awaited<ReturnType<typeof getShopIngredientsAction>>[number];

export function useShopIngredients() {
  const fetcher = () => getShopIngredientsAction();
  const { data, error, isLoading, mutate } = useSWR(
    "shop-ingredients",
    fetcher
  );
  return { data, error, isLoading, mutate };
}
