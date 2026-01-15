"use client";

import useSWR from "swr";
import { getCurrentUser } from "../db";

export function useUser() {
  const fetcher = () => getCurrentUser();
  const { data, error, isLoading, mutate } = useSWR("user", fetcher);
  return { data, error, isLoading, mutate };
}
