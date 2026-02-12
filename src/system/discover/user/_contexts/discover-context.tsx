"use client";

import React, { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { getDiscoverVideosAction, getRecipeWebsitesAction } from "../db";
import { DiscoverVideo, RecipeWebsites } from "@prisma/client";

interface DiscoverContextValue {
  videos: DiscoverVideo[];
  websites: RecipeWebsites[];
  videosLoading: boolean;
  websitesLoading: boolean;
  videosError: Error | undefined;
  websitesError: Error | undefined;
  mutateVideos: () => Promise<DiscoverVideo[] | undefined>;
  mutateWebsites: () => Promise<RecipeWebsites[] | undefined>;
}

const DiscoverContext = createContext<DiscoverContextValue | undefined>(undefined);

interface DiscoverProviderProps {
  children: ReactNode;
}

export function DiscoverProvider({ children }: DiscoverProviderProps) {
  const {
    data: videos,
    error: videosError,
    isLoading: videosLoading,
    mutate: mutateVideos,
  } = useSWR("discover-videos-user", () => getDiscoverVideosAction());

  const {
    data: websites,
    error: websitesError,
    isLoading: websitesLoading,
    mutate: mutateWebsites,
  } = useSWR("discover-websites-user", () => getRecipeWebsitesAction());

  const value: DiscoverContextValue = {
    videos: videos || [],
    websites: websites || [],
    videosLoading,
    websitesLoading,
    videosError,
    websitesError,
    mutateVideos,
    mutateWebsites,
  };

  return (
    <DiscoverContext.Provider value={value}>
      {children}
    </DiscoverContext.Provider>
  );
}

export function useDiscover() {
  const context = useContext(DiscoverContext);
  if (context === undefined) {
    throw new Error("useDiscover must be used within a DiscoverProvider");
  }
  return context;
}

// Individual hooks that don't require provider
export function useDiscoverVideos() {
  const fetcher = () => getDiscoverVideosAction();
  const { data, error, isLoading, mutate } = useSWR("discover-videos-user", fetcher);
  return { data: data || [], error, isLoading, mutate };
}

export function useRecipeWebsites() {
  const fetcher = () => getRecipeWebsitesAction();
  const { data, error, isLoading, mutate } = useSWR("discover-websites-user", fetcher);
  return { data: data || [], error, isLoading, mutate };
}
