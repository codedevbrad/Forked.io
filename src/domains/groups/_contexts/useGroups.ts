"use client";

import useSWR from "swr";
import { getGroupsAction } from "../db";

export function useGroups() {
  const fetcher = () => getGroupsAction();
  const { data, error, isLoading, mutate } = useSWR("groups", fetcher);
  return { data, error, isLoading, mutate };
}
