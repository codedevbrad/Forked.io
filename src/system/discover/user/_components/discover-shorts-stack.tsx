"use client";

import React, { useState } from "react";
import { YouTubeShort, YouTubeShortData } from "@/src/components/custom/youtube-short";
import { useDiscoverVideos } from "../_contexts/discover-context";
import { DiscoverType } from "@prisma/client";
import { Button } from "@/src/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function DiscoverShortsStack() {
  const { data: videos, isLoading: videosLoading, error: videosError } = useDiscoverVideos();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  if (videosLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[600px]">
        <div className="text-center py-8 text-muted-foreground">Loading videos...</div>
      </div>
    );
  }

  if (videosError) {
    return (
      <div className="w-full flex justify-center items-center min-h-[600px]">
        <div className="text-center py-8 text-destructive">Error loading videos</div>
      </div>
    );
  }

  // Filter videos to only show YouTube shorts
  const youtubeShorts = videos.filter((video) => video.type === DiscoverType.YOUTUBE);

  if (youtubeShorts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[600px]">
        <div className="text-center py-8 text-muted-foreground">No videos available</div>
      </div>
    );
  }

  const handleLike = () => {
    handleSwipe(true);
  };

  const handleDislike = () => {
    handleSwipe(false);
  };

  const handleSwipe = (liked: boolean) => {
    if (currentIndex >= youtubeShorts.length - 1) return;

    const direction = liked ? "right" : "left";
    setSwipeDirection(direction);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  // Get visible cards (current and next few for stacking effect)
  const visibleCards = youtubeShorts.slice(currentIndex, currentIndex + 3);
  const remainingCards = youtubeShorts.length - currentIndex;

  if (remainingCards === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[600px]">
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg font-semibold mb-2">You've seen all videos!</p>
          <p className="text-sm">Check back later for more content.</p>
        </div>
      </div>
    );
  }

  const isFinalCard = remainingCards === 1;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 w-full max-w-2xl mx-auto">
        {isFinalCard ? (
          <div className="w-14 h-14 shrink-0" aria-hidden />
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleDislike}
            className="rounded-full w-14 h-14 p-0 shadow-lg shrink-0"
            aria-label="Decline"
          >
            <ThumbsDown className="w-6 h-6" />
          </Button>
        )}
        <div
          className="relative flex-1 max-w-md mx-auto mb-6 min-w-0"
          style={{ aspectRatio: "9/16" }}
        >
        {visibleCards.map((video, index) => {
          const isTopCard = index === 0;
          const isExiting = isTopCard && swipeDirection !== null;

          const shortData: YouTubeShortData = {
            id: video.url,
            title: video.name,
            channelName: video.description || "",
            key: video.id,
          };

          return (
            <div
              key={video.id}
              className={cn(
                "absolute inset-0 transition-all duration-300 ease-out",
                isTopCard
                  ? isExiting
                    ? swipeDirection === "right"
                      ? "z-30 translate-x-full opacity-0 pointer-events-none"
                      : "z-30 -translate-x-full opacity-0 pointer-events-none"
                    : "z-30 translate-y-0 translate-x-0 scale-100 opacity-100"
                  : index === 1
                  ? "z-20 translate-y-2 scale-[0.95] opacity-90"
                  : "z-10 translate-y-4 scale-[0.9] opacity-80"
              )}
            >
              <div className="relative w-full h-full">
                <YouTubeShort short={shortData} className="h-full" />
              </div>
            </div>
          );
        })}
        </div>
        {isFinalCard ? (
          <div className="w-14 h-14 shrink-0" aria-hidden />
        ) : (
          <Button
            size="lg"
            variant="default"
            onClick={handleLike}
            className="rounded-full w-14 h-14 p-0 shadow-lg shrink-0 bg-green-600 hover:bg-green-700"
            aria-label="Accept"
          >
            <ThumbsUp className="w-6 h-6" />
          </Button>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        {remainingCards} {remainingCards === 1 ? "video" : "videos"} remaining
      </div>
    </div>
  );
}
