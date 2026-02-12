"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { ScrapeWebsiteProgress } from "./scrape-website-progress";
import {
  scrapeRecipeWebsiteAction,
  createRecipeWebsiteAction,
} from "../db";
import { useRecipeWebsites } from "../_contexts/useRecipeWebsites";
import type { ScrapedWebsiteMeta } from "@/src/generate/fetch.website/scrape.website";
import { Check, RotateCcw, X } from "lucide-react";

type CreateRecipeWebsiteByUrlProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FlowStep = "url" | "scraping" | "preview";

export function CreateRecipeWebsiteByUrl({
  onSuccess,
  onCancel,
}: CreateRecipeWebsiteByUrlProps) {
  const { mutate } = useRecipeWebsites();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<FlowStep>("url");
  const [scraped, setScraped] = useState<ScrapedWebsiteMeta | null>(null);
  const [preview, setPreview] = useState<ScrapedWebsiteMeta & { url: string } | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmitUrl = () => {
    setError("");
    if (!url.trim()) {
      setError("Please paste a URL");
      return;
    }
    setStep("scraping");
    startTransition(async () => {
      const result = await scrapeRecipeWebsiteAction(url.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to scrape");
        setStep("url");
        return;
      }
      setScraped(result.data);
      setPreview({
        ...result.data,
        url: url.trim(),
      });
      setStep("preview");
    });
  };

  const handleRetry = () => {
    setError("");
    setStep("scraping");
    startTransition(async () => {
      const result = await scrapeRecipeWebsiteAction(url.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to scrape");
        setStep("preview");
        return;
      }
      setScraped(result.data);
      setPreview({
        ...result.data,
        url: url.trim(),
      });
    });
  };

  const handleAccept = () => {
    if (!preview) return;
    setError("");
    startTransition(async () => {
      const result = await createRecipeWebsiteAction(preview.name, preview.url, {
        description: preview.description,
        imageURL: preview.imageURL,
        logoURL: preview.logoURL,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to save");
        return;
      }
      await mutate();
      onSuccess?.();
    });
  };

  const handleDeny = () => {
    onCancel?.();
  };

  const updatePreview = (updates: Partial<ScrapedWebsiteMeta & { url: string }>) => {
    if (preview) setPreview({ ...preview, ...updates });
  };

  if (step === "url") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="create-url" className="text-sm font-medium">
            Paste website URL
          </label>
          <Input
            id="create-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com"
            disabled={isPending}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitUrl()}
          />
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSubmitUrl}
            disabled={isPending || !url.trim()}
            className="flex-1"
          >
            Fetch website
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === "scraping") {
    return (
      <div className="space-y-6 py-4">
        <ScrapeWebsiteProgress isLoading={true} />
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  // preview
  if (!preview) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review and edit the detected information, then Accept to save or Retry to fetch again.
      </p>
      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="preview-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="preview-name"
            value={preview.name}
            onChange={(e) => updatePreview({ name: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="preview-url" className="text-sm font-medium">
            URL
          </label>
          <Input
            id="preview-url"
            type="url"
            value={preview.url}
            onChange={(e) => updatePreview({ url: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="preview-desc" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="preview-desc"
            value={preview.description}
            onChange={(e) => updatePreview({ description: e.target.value })}
            disabled={isPending}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="preview-image" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="preview-image"
              type="url"
              value={preview.imageURL}
              onChange={(e) => updatePreview({ imageURL: e.target.value })}
              disabled={isPending}
            />
            {preview.imageURL && !preview.imageURL.includes("placeholder") && (
              <img
                src={preview.imageURL}
                alt="Preview"
                className="h-20 w-20 object-cover rounded border mt-1"
              />
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="preview-logo" className="text-sm font-medium">
              Logo URL
            </label>
            <Input
              id="preview-logo"
              type="url"
              value={preview.logoURL}
              onChange={(e) => updatePreview({ logoURL: e.target.value })}
              disabled={isPending}
            />
            {preview.logoURL && !preview.logoURL.includes("placeholder") && (
              <img
                src={preview.logoURL}
                alt="Logo"
                className="h-10 w-10 object-contain rounded border mt-1"
              />
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          onClick={handleAccept}
          disabled={isPending}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleRetry}
          disabled={isPending}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDeny}
          disabled={isPending}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Deny
        </Button>
      </div>
    </div>
  );
}
