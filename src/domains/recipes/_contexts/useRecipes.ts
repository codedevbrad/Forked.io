"use client";

import useSWR from "swr";
import { getRecipesAction } from "../db";

export function useRecipes() {
  const fetcher = () => getRecipesAction();
  const { data, error, isLoading, mutate } = useSWR("recipes", fetcher);
  return { data, error, isLoading, mutate };
}
