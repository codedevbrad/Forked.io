"use client";

import useSWR from "swr";
import { getStoredAction } from "../db";

export function useStored() {
  const fetcher = () => getStoredAction();
  const { data, error, isLoading, mutate } = useSWR("stored", fetcher);
  return { data, error, isLoading, mutate };
}
