"use client";

import useSWR from "swr";
import { getCategoriesAction } from "../db";

export function useCategories() {
  const fetcher = () => getCategoriesAction();
  const { data, error, isLoading, mutate } = useSWR("categories", fetcher);
  return { data, error, isLoading, mutate };
}
