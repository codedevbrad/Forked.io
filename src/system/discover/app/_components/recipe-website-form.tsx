"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createRecipeWebsiteAction, updateRecipeWebsiteAction } from "@/src/system/discover/app/db";
import { useRecipeWebsites } from "@/src/system/discover/app/_contexts/useRecipeWebsites";

type RecipeWebsiteFormProps = {
  websiteId?: string;
  initialName?: string;
  initialUrl?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function RecipeWebsiteForm({ 
  websiteId, 
  initialName = "", 
  initialUrl = "",
  onSuccess,
  onCancel 
}: RecipeWebsiteFormProps) {
  const { mutate } = useRecipeWebsites();
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!websiteId;

  useEffect(() => {
    setName(initialName);
    setUrl(initialUrl);
  }, [initialName, initialUrl, websiteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Website name is required");
      return;
    }

    if (!url.trim()) {
      setError("Website URL is required");
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateRecipeWebsiteAction(websiteId, name, url)
        : await createRecipeWebsiteAction(name, url);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setUrl("");
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Website Name 
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., AllRecipes, Food Network"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          Website URL 
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isPending}
          placeholder="https://www.example.com"
        />
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
            : (isEditing ? "Update Website" : "Create Website")
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
