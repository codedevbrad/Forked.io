"use client";

import useSWR from "swr";
import { getIngredientsAction } from "../db";

export function useIngredients() {
  const fetcher = () => getIngredientsAction();
  const { data, error, isLoading, mutate } = useSWR("ingredients", fetcher);
  return { data, error, isLoading, mutate };
}
