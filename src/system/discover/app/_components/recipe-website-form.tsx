"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { createRecipeWebsiteAction, updateRecipeWebsiteAction } from "@/src/system/discover/app/db";
import { useRecipeWebsites } from "@/src/system/discover/app/_contexts/useRecipeWebsites";

type RecipeWebsiteFormProps = {
  websiteId?: string;
  initialName?: string;
  initialUrl?: string;
  initialDescription?: string;
  initialImageURL?: string;
  initialLogoURL?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function RecipeWebsiteForm({
  websiteId,
  initialName = "",
  initialUrl = "",
  initialDescription = "",
  initialImageURL = "https://via.placeholder.com/150",
  initialLogoURL = "https://via.placeholder.com/150",
  onSuccess,
  onCancel,
}: RecipeWebsiteFormProps) {
  const { mutate } = useRecipeWebsites();
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [description, setDescription] = useState(initialDescription);
  const [imageURL, setImageURL] = useState(initialImageURL);
  const [logoURL, setLogoURL] = useState(initialLogoURL);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!websiteId;

  useEffect(() => {
    setName(initialName);
    setUrl(initialUrl);
    setDescription(initialDescription);
    setImageURL(initialImageURL);
    setLogoURL(initialLogoURL);
  }, [initialName, initialUrl, initialDescription, initialImageURL, initialLogoURL, websiteId]);

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
        ? await updateRecipeWebsiteAction(websiteId, name, url, {
            description,
            imageURL,
            logoURL,
          })
        : await createRecipeWebsiteAction(name, url, {
            description,
            imageURL,
            logoURL,
          });

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
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="imageURL" className="text-sm font-medium">
            Image URL
          </label>
          <Input
            id="imageURL"
            type="url"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="logoURL" className="text-sm font-medium">
            Logo URL
          </label>
          <Input
            id="logoURL"
            type="url"
            value={logoURL}
            onChange={(e) => setLogoURL(e.target.value)}
            disabled={isPending}
          />
        </div>
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
