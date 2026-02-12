"use client";

import useSWR from "swr";
import { getDiscoverVideosAction } from "../db";

export function useDiscoverVideos() {
  const fetcher = () => getDiscoverVideosAction();
  const { data, error, isLoading, mutate } = useSWR("discover-videos", fetcher);
  return { data, error, isLoading, mutate };
}
