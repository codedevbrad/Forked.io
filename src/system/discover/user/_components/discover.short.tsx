"use client";

import React from "react";
import { YouTubeShort } from "@/src/components/custom/youtube-short";
import { useDiscoverVideos } from "../_contexts/discover-context";
import { DiscoverType } from "@prisma/client";

export function DiscoverShorts() {
  const { data: videos, isLoading: videosLoading, error: videosError } = useDiscoverVideos();

  if (videosLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-muted-foreground">Loading videos...</div>
      </div>
    );
  }

  if (videosError) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-destructive">Error loading videos</div>
      </div>
    );
  }

  // Filter videos to only show YouTube shorts
  const youtubeShorts = videos.filter((video) => video.type === DiscoverType.YOUTUBE);

  if (youtubeShorts.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-muted-foreground">No videos available</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {youtubeShorts.map((video) => (
          <YouTubeShort
            key={video.id}
            short={{
              id: video.url,
              title: video.name,
              channelName: video.description || "",
              key: video.id,
            }}
          />
        ))}
      </div>
    </div>
  );
}
