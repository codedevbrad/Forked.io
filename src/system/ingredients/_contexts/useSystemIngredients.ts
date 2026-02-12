"use client";

import useSWR from "swr";
import { getSystemShopIngredientsWithUserCountAction } from "../db";

export function useSystemIngredients() {
  const fetcher = () => getSystemShopIngredientsWithUserCountAction();
  const { data, error, isLoading, mutate } = useSWR(
    "system-ingredients",
    fetcher
  );
  return { data, error, isLoading, mutate };
}
