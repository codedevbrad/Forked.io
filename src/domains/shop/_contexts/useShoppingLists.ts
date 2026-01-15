"use client";

import useSWR from "swr";
import { getShoppingListsAction } from "../db";

export function useShoppingLists() {
  const fetcher = () => getShoppingListsAction();
  const { data, error, isLoading, mutate } = useSWR("shoppingLists", fetcher);
  return { data, error, isLoading, mutate };
}
