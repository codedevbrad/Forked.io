"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { searchUnsplashImagesAction } from "@/src/domains/recipes/db";
import type { UnsplashPhoto } from "@/src/services/unsplash";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { Loader2, Search, CheckCircle2 } from "lucide-react";

type UnsplashPickerProps = {
  /** Currently selected image URL (null = nothing selected). */
  selectedImageUrl: string | null;
  /** Called when user selects or deselects an image. */
  onSelectImage: (url: string | null) => void;
  /** Pre-fill the search bar and optionally auto-search on mount. */
  initialQuery?: string;
  /** Auto-search on first render when initialQuery is set. */
  autoSearch?: boolean;
  disabled?: boolean;
};

export function UnsplashPicker({
  selectedImageUrl,
  onSelectImage,
  initialQuery = "",
  autoSearch = false,
  disabled,
}: UnsplashPickerProps) {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearchQuery(query.trim());

    try {
      const result = await searchUnsplashImagesAction(query.trim());
      if (result.success && result.data) {
        setPhotos(result.data.photos);
      } else {
        setError(result.error || "Failed to search Unsplash");
      }
    } catch {
      setError("Failed to search Unsplash images");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  // Auto-search on first render if requested
  const didAutoSearch = useRef(false);
  useEffect(() => {
    if (autoSearch && initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Unsplash for images..."
          className="h-8 text-sm"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(searchQuery);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleSearch(searchQuery)}
          disabled={disabled || loading}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Results */}
      {loading && photos.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p className="text-sm">{error}</p>
        </div>
      ) : photos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onSelectImage(
                    photo.url === selectedImageUrl ? null : photo.url
                  )
                }
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 transition-all group",
                  selectedImageUrl === photo.url
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Image
                  src={photo.thumbUrl}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {selectedImageUrl === photo.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">
                    by{" "}
                    <a
                      href={`${photo.photographerUrl}?utm_source=forkedio&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {photo.photographer}
                    </a>
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Photos from{" "}
            <a
              href="https://unsplash.com/?utm_source=forkedio&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </p>
        </>
      ) : hasSearched && !loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Search className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No Unsplash results found</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Search className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">Search Unsplash for recipe images</p>
          <p className="text-xs mt-1">Enter a search term above to find images</p>
        </div>
      ) : null}
    </div>
  );
}
