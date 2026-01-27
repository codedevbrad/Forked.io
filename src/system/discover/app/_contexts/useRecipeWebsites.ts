"use client";

import useSWR from "swr";
import { getRecipeWebsitesAction } from "../db";

export function useRecipeWebsites() {
  const fetcher = () => getRecipeWebsitesAction();
  const { data, error, isLoading, mutate } = useSWR("recipe-websites", fetcher);
  return { data, error, isLoading, mutate };
}
