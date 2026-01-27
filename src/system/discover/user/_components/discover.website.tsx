"use client";

import React from "react";
import { useRecipeWebsites } from "../_contexts/discover-context";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {websites.map((website) => (
            <div key={website.id} className="flex flex-col p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <Link href={website.url} target="_blank" rel="noopener noreferrer">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{website.name}</h3>
                </Link>
            </div>
        ))}
      </div>
    </div>
  );
}
