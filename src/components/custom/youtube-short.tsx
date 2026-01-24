"use client"

import { Button } from "@/src/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/src/components/ui/popover"

export interface YouTubeShortData {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: number;
  uploadDate?: string;
  key: string;
}

interface YouTubeShortProps {
  short: YouTubeShortData;
  className?: string;
}

function extractVideoId(idOrUrl: string): string {
  // Handle Shorts URL format: https://www.youtube.com/shorts/{videoId}
  const shortsMatch = idOrUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return shortsMatch[1];
  }
  
  // Handle regular YouTube URL format: https://www.youtube.com/watch?v={videoId}
  const watchMatch = idOrUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }
  
  // Handle youtu.be format: https://youtu.be/{videoId}
  const youtuBeMatch = idOrUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) {
    return youtuBeMatch[1];
  }
  
  // If it's already just a video ID, return it as is
  return idOrUrl;
}

export function YouTubeShort({ short, className }: YouTubeShortProps) {
  const videoId = extractVideoId(short.id);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <iframe
          src={embedUrl}
          title={short.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              className="absolute bottom-15 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              View Recipe
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-64">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{short.title}</h4>
              <p className="text-xs text-muted-foreground">{short.channelName}</p>
              {/* Add your popover content here */}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-semibold text-sm line-clamp-2">{short.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{short.channelName}</span>
       
          {short.uploadDate && (
            <>
              <span>•</span>
              <span>{short.uploadDate}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

