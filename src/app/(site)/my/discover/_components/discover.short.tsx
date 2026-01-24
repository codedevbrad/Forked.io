"use client";

import React from "react";
import { YouTubeShort, YouTubeShortData } from "@/src/components/custom/youtube-short";

// Dummy data for YouTube Shorts
const dummyShorts: YouTubeShortData[] = [
  {
    id: "https://www.youtube.com/shorts/HduytF6T4e4",
    title: "Onion Pasta",
    channelName: "Foodie Shorts",
    views: 1250000,
    uploadDate: "2 days ago",
    key: "HduytF6T4e4",
  },
  {
    id: "https://www.youtube.com/shorts/huY87nvs6IE",
    title: "Amazing Cooking Technique You've Never Seen",
    channelName: "Chef Secrets",
    views: 1500000,
    uploadDate: "1 day ago",
    key: "fjfgjrn",
  },
  {
    id: "https://www.youtube.com/shorts/HduytF6T4e4",
    title: "Onion Pasta",
    channelName: "Foodie Shorts",
    views: 1250000,
    uploadDate: "2 days ago",
    key: "ffkdkkd",
  },
  {
    id: "https://www.youtube.com/watch?v=dLairfd8bZU",
    title: "Onion Pasta",
    channelName: "Foodie Shorts",
    views: 1250000,
    uploadDate: "2 days ago",
    key: "skdmcmn",
  }
];

export function DiscoverShorts() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {dummyShorts.map((short) => (
             <YouTubeShort key={short.key} short={short} />
          ))}
      </div>
    </div>
  );
}
