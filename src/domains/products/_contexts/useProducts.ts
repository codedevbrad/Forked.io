"use client";

import useSWR from "swr";
import { getProductsAction } from "../db";

export function useProducts() {
  const fetcher = () => getProductsAction();
  const { data, error, isLoading, mutate } = useSWR("products", fetcher);
  return { data, error, isLoading, mutate };
}
