"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createDiscoverVideoAction, updateDiscoverVideoAction } from "@/src/system/discover/app/db";
import { useDiscoverVideos } from "@/src/system/discover/app/_contexts/useDiscoverVideos";
import { DiscoverType } from "@prisma/client";

type DiscoverVideoFormProps = {
  videoId?: string;
  initialName?: string;
  initialDescription?: string;
  initialUrl?: string;
  initialType?: DiscoverType;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function DiscoverVideoForm({ 
  videoId, 
  initialName = "", 
  initialDescription = "",
  initialUrl = "",
  initialType = DiscoverType.YOUTUBE,
  onSuccess,
  onCancel 
}: DiscoverVideoFormProps) {
  const { mutate } = useDiscoverVideos();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [url, setUrl] = useState(initialUrl);
  const [type, setType] = useState<DiscoverType>(initialType);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!videoId;

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setUrl(initialUrl);
    setType(initialType);
  }, [initialName, initialDescription, initialUrl, initialType, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Video name is required");
      return;
    }

    if (!url.trim()) {
      setError("Video URL is required");
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateDiscoverVideoAction(videoId, name, description, url, type)
        : await createDiscoverVideoAction(name, description, url, type);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setDescription("");
        setUrl("");
        setType(DiscoverType.YOUTUBE);
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Video Name 
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., Amazing Pasta Recipe"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          placeholder="Optional description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          Video URL 
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isPending}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Platform Type
        </label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as DiscoverType)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DiscoverType.YOUTUBE}>YouTube</SelectItem>
            <SelectItem value={DiscoverType.TIKTOK}>TikTok</SelectItem>
            <SelectItem value={DiscoverType.INSTAGRAM}>Instagram</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Video" : "Create Video")
          }
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
