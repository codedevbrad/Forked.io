"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { previewRecipeFromUrlAction, savePreviewedRecipeAction, uploadRecipeImageAction } from "@/src/domains/recipes/db";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { Link2, Loader2, CheckCircle2, Circle } from "lucide-react";
import type { ExtractedIngredient } from "@/src/services/openai";
import Image from "next/image";

type ImportRecipeDialogProps = {
  onSuccess?: () => void;
};

type ImportStep = "idle" | "fetching" | "finding" | "creating" | "success";

export function ImportRecipeDialog({ onSuccess }: ImportRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<ImportStep>("idle");
  const [previewData, setPreviewData] = useState<{ name: string; ingredients: ExtractedIngredient[]; images: string[] } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { mutate } = useRecipes();

  const handleImport = () => {
    if (!url.trim()) {
      setError("Please enter a recipe URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.trim());
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setError("");
    setPreviewData(null);
    setStep("fetching");

    startTransition(async () => {
      try {
        // Step 1: Fetching from the site
        setStep("fetching");
        const previewResult = await previewRecipeFromUrlAction(url.trim());
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!previewResult.success) {
          setError(previewResult.error);
          setStep("idle");
          return;
        }

        // Step 2: Finding ingredients
        setStep("finding");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Creating a recipe (preparing data)
        setStep("creating");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Success - show preview
        setPreviewData(previewResult.data!);
        setStep("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        setStep("idle");
      }
    });
  };

  const handleAccept = async () => {
    if (!previewData) return;

    startTransition(async () => {
      let finalImageUrl: string | undefined;

      // If an image is selected, upload it to R2
      if (selectedImageUrl) {
        setUploadingImage(true);
        const uploadResult = await uploadRecipeImageAction(selectedImageUrl);
        setUploadingImage(false);

        if (!uploadResult.success) {
          setError(uploadResult.error);
          return;
        }

        finalImageUrl = uploadResult.data?.url;
      }

      const result = await savePreviewedRecipeAction(
        previewData.name,
        previewData.ingredients,
        url.trim(),
        finalImageUrl
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setUrl("");
      setPreviewData(null);
      setSelectedImageUrl(null);
      setStep("idle");
      setOpen(false);
      await mutate();
      onSuccess?.();
    });
  };

  const handleCancel = () => {
    setUrl("");
    setPreviewData(null);
    setSelectedImageUrl(null);
    setStep("idle");
    setError("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setUrl("");
      setError("");
      setPreviewData(null);
      setSelectedImageUrl(null);
      setStep("idle");
    }
  };

  const formatIngredient = (ing: ExtractedIngredient) => {
    return `${ing.quantity} ${ing.unit} ${ing.name}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Link2 className="w-4 h-4 mr-2" />
          Import recipe from URL
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[500px] max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Recipe from URL</DialogTitle>
          <DialogDescription>
            Paste a recipe URL to automatically extract the recipe name and ingredients.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {step === "idle" && (
            <>
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Recipe URL
                </label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="https://example.com/recipe"
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isPending) {
                      handleImport();
                    }
                  }}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={isPending || !url.trim()}
                  className="flex-1"
                >
                  Import Recipe
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {(step === "fetching" || step === "finding" || step === "creating") && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {/* Step 1: Fetching */}
                <div className="flex items-center gap-3">
                  {step === "fetching" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : step === "finding" || step === "creating" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={step === "fetching" ? "font-medium" : step === "finding" || step === "creating" ? "text-muted-foreground" : ""}>
                    Fetching from the site
                  </span>
                </div>

                {/* Step 2: Finding ingredients */}
                <div className="flex items-center gap-3">
                  {step === "finding" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : step === "creating" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={step === "finding" ? "font-medium" : step === "creating" ? "text-muted-foreground" : ""}>
                    Finding ingredients
                  </span>
                </div>

                {/* Step 3: Creating recipe */}
                <div className="flex items-center gap-3">
                  {step === "creating" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={step === "creating" ? "font-medium" : ""}>
                    Creating a recipe
                  </span>
                </div>

                {/* Step 4: Success (placeholder) */}
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Success</span>
                </div>
              </div>
            </div>
          )}

          {step === "success" && previewData && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {/* All steps completed */}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Fetching from the site</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Finding ingredients</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Creating a recipe</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Success</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recipe Title</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {previewData.name}
                  </p>
                </div>

                {previewData.images && previewData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Found Images</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {previewData.images.map((imgUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageUrl(imgUrl === selectedImageUrl ? null : imgUrl)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageUrl === imgUrl
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Recipe image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              // Hide broken images
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          {selectedImageUrl === imgUrl && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedImageUrl && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Selected image will be uploaded to your storage
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ingredients Found</h3>
                  <ul className="space-y-1 bg-muted p-3 rounded max-h-48 overflow-y-auto">
                    {previewData.ingredients.map((ing, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {formatIngredient(ing)}
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleAccept} 
                    disabled={isPending || uploadingImage}
                    className="flex-1"
                  >
                    {isPending || uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadingImage ? "Uploading image..." : "Saving..."}
                      </>
                    ) : (
                      "Accept"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex-1"
                  >
                    No thanks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
