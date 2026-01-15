"use client";

import useSWR from "swr";
import { getTagsAction } from "../db";

export function useTags() {
  const fetcher = () => getTagsAction();
  const { data, error, isLoading, mutate } = useSWR("tags", fetcher);
  return { data, error, isLoading, mutate };
}
