"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecipeWebsites } from "../_contexts/discover-context";
import { ExternalLink } from "lucide-react";

export function DiscoverWebsites() {
  const { data: websites, isLoading: websitesLoading, error: websitesError } = useRecipeWebsites();

  if (websitesLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-muted-foreground">Loading websites...</div>
      </div>
    );
  }

  if (websitesError) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-destructive">Error loading websites</div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-muted-foreground">No websites available</div>
      </div>
    );
  }

  const hasImage = (url: string) =>
    url && !url.includes("via.placeholder.com");

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {websites.map((website) => (
          <Link
            key={website.id}
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden border rounded-lg hover:bg-accent/50 transition-colors"
          >
          
            <div className="flex flex-col flex-1 p-4">
              <div className="flex items-center gap-2 mb-2">
                {hasImage(website.logoURL) && (
                  <Image
                    src={website.logoURL}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded object-contain shrink-0"
                    unoptimized
                  />
                )}
                <h3 className="font-semibold text-lg line-clamp-2">{website.name}</h3>
              </div>
              {website.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                  {website.description}
                </p>
              ) : null}
              <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
                Visit site
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
