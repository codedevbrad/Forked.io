"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createRecipeAction, RecipeIngredientInput, uploadRecipeImageAction } from "@/src/domains/recipes/db";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { ensureIngredientForShopAction } from "@/src/domains/ingredients/db";
import {
  IngredientPicker,
  PickedIngredient,
  IngredientSource,
  compositeKey,
} from "@/src/domains/ingredients/_components/ingredient-picker";
import { UnsplashPicker } from "@/src/components/ui/unsplash-picker";
import { TagSelector } from "@/src/domains/ingredients/_components/tag-selector";
import { Unit } from "@prisma/client";
import { X, CheckCircle2, Circle, ChevronRight, ChevronDown, ImageIcon } from "lucide-react";
import Image from "next/image";

type SelectedIngredient = {
  source: IngredientSource;
  originalId: string;
  ingredientId: string;
  name: string;
  quantity: string;
  unit: Unit;
};

type RecipeFormProps = {
  initialName?: string;
  initialTags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "Recipe Name",
  2: "Ingredients",
  3: "Tags",
  4: "Picture",
  5: "Complete",
};

export function RecipeForm({ 
  initialName = "", 
  initialTags = [],
  onSuccess,
  onCancel 
}: RecipeFormProps) {
  const { data: userIngredients, mutate: mutateIngredients } = useIngredients();
  const { mutate } = useRecipes();
  const [name, setName] = useState(initialName);
  const [recipeIngredients, setRecipeIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTags.map(tag => tag.id));
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Build shopIngredientId → Ingredient.id map
  const shopToIngredientMap = useMemo(() => {
    const map = new Map<string, { ingredientId: string; name: string }>();
    userIngredients?.forEach((ui) => {
      if (ui.shopIngredientId) {
        map.set(ui.shopIngredientId, {
          ingredientId: ui.id,
          name: getIngredientDisplayName(ui),
        });
      }
    });
    return map;
  }, [userIngredients]);

  // Build selected set for the picker
  const selectedSet = useMemo(
    () => new Set(recipeIngredients.map((i) => compositeKey(i.source, i.originalId))),
    [recipeIngredients]
  );

  // Picker toggle handler
  const handlePickerToggle = useCallback(
    (item: PickedIngredient) => {
      const key = compositeKey(item.source, item.id);

      setRecipeIngredients((prev) => {
        const exists = prev.some(
          (i) => compositeKey(i.source, i.originalId) === key
        );

        if (exists) {
          return prev.filter(
            (i) => compositeKey(i.source, i.originalId) !== key
          );
        }

        if (item.source === "user") {
          return [
            ...prev,
            {
              source: "user",
              originalId: item.id,
              ingredientId: item.id,
              name: item.name,
              quantity: "",
              unit: Unit.g,
            },
          ];
        }

        const resolved = shopToIngredientMap.get(item.id);
        return [
          ...prev,
          {
            source: "shop",
            originalId: item.id,
            ingredientId: resolved?.ingredientId ?? "",
            name: item.name,
            quantity: "",
            unit: Unit.g,
          },
        ];
      });
    },
    [shopToIngredientMap]
  );

  const removeIngredient = (source: IngredientSource, originalId: string) => {
    const key = compositeKey(source, originalId);
    setRecipeIngredients((prev) =>
      prev.filter((i) => compositeKey(i.source, i.originalId) !== key)
    );
  };

  const updateIngredientField = (
    source: IngredientSource,
    originalId: string,
    field: "quantity" | "unit",
    value: string | Unit
  ) => {
    const key = compositeKey(source, originalId);
    setRecipeIngredients((prev) =>
      prev.map((i) =>
        compositeKey(i.source, i.originalId) === key
          ? { ...i, [field]: value }
          : i
      )
    );
  };

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      setError("Recipe name is required");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (recipeIngredients.length === 0) {
      setError("At least one ingredient is required");
      return false;
    }

    for (const ing of recipeIngredients) {
      if (!ing.quantity) {
        setError("All ingredients must have a quantity");
        return false;
      }
      const quantity = parseFloat(ing.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError("All ingredient quantities must be valid positive numbers");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      // Tags — no validation needed
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Picture — optional, no validation
      setCurrentStep(5);
    }
  };

  const handlePrevious = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentStep !== 5) return;
    if (!validateStep1() || !validateStep2()) return;

    startTransition(async () => {
      // Resolve any shop ingredients that still need an Ingredient record
      const validIngredients: RecipeIngredientInput[] = [];

      for (const ing of recipeIngredients) {
        const quantity = parseFloat(ing.quantity);
        if (isNaN(quantity) || quantity <= 0) continue;

        let ingredientId = ing.ingredientId;

        if (!ingredientId) {
          const result = await ensureIngredientForShopAction(ing.originalId);
          if (!result.success) {
            setError(result.error);
            return;
          }
          ingredientId = result.data!.id;
        }

        validIngredients.push({ ingredientId, quantity, unit: ing.unit });
      }

      // Upload the selected image to R2 if one was chosen
      let finalImageUrl: string | undefined;
      if (selectedImageUrl) {
        const uploadResult = await uploadRecipeImageAction(selectedImageUrl);
        if (!uploadResult.success) {
          setError(uploadResult.error);
          return;
        }
        finalImageUrl = uploadResult.data?.url;
      }

      const result = await createRecipeAction(
        name,
        validIngredients,
        selectedTagIds,
        finalImageUrl
      );

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setRecipeIngredients([]);
        setSelectedTagIds([]);
        setSelectedImageUrl(null);
        setCurrentStep(1);
        await mutate();
        await mutateIngredients();
        onSuccess?.();
      }
    });
  };

  // Step indicator helper
  const renderStepIndicator = (step: Step) => {
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;
    return (
      <div className="flex items-center gap-2 flex-1" key={step}>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : isActive ? (
            <Circle className="w-5 h-5 text-primary fill-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
          <span className={`text-xs ${isActive ? "font-medium" : "text-muted-foreground"}`}>
            {STEP_LABELS[step]}
          </span>
        </div>
        {step < 5 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between w-full">
        {([1, 2, 3, 4, 5] as Step[]).map(renderStepIndicator)}
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {/* Step 1: Recipe Name */}
        {currentStep === 1 && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Recipe Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
              placeholder="e.g., Chocolate Cake, Pasta Carbonara"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Ingredients */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-medium w-full text-left"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${pickerOpen ? "" : "-rotate-90"}`}
                />
                Browse Ingredients
                {recipeIngredients.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({recipeIngredients.length} selected)
                  </span>
                )}
              </button>
              {pickerOpen && (
                <div className="border rounded-lg p-3">
                  <IngredientPicker
                    selected={selectedSet}
                    onToggle={handlePickerToggle}
                    disabled={isPending}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected Ingredients ({recipeIngredients.length})
              </label>

              {recipeIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Browse and click ingredients above to add them to this recipe.
                </p>
              ) : (
                <div className="space-y-2">
                  {recipeIngredients.map((ing) => {
                    const key = compositeKey(ing.source, ing.originalId);
                    return (
                      <div key={key} className="flex gap-2 items-center border rounded-md px-3 py-2">
                        <span className="flex-1 text-sm font-medium truncate">
                          {ing.name}
                        </span>
                        <div className="w-20">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={ing.quantity}
                            onChange={(e) =>
                              updateIngredientField(ing.source, ing.originalId, "quantity", e.target.value)
                            }
                            placeholder="Qty"
                            disabled={isPending}
                            className="h-8"
                          />
                        </div>
                        <div className="w-24">
                          <Select
                            value={ing.unit}
                            onValueChange={(value) =>
                              updateIngredientField(ing.source, ing.originalId, "unit", value as Unit)
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(Unit).map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ing.source, ing.originalId)}
                          disabled={isPending}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Tags */}
        {currentStep === 3 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <p className="text-sm text-muted-foreground mb-2">
              Add tags to categorize your recipe (optional)
            </p>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onSelectionChange={setSelectedTagIds}
              disabled={isPending}
            />
          </div>
        )}

        {/* Step 4: Picture */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Recipe Image</label>
            <p className="text-sm text-muted-foreground">
              Search Unsplash for a picture to represent your recipe (optional)
            </p>
            <UnsplashPicker
              selectedImageUrl={selectedImageUrl}
              onSelectImage={setSelectedImageUrl}
              initialQuery={name}
              autoSearch={!!name.trim()}
              disabled={isPending}
            />
            {selectedImageUrl && (
              <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50">
                <div className="relative w-16 h-10 rounded overflow-hidden shrink-0">
                  <Image
                    src={selectedImageUrl}
                    alt="Selected recipe image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-muted-foreground flex-1">Image selected</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImageUrl(null)}
                  disabled={isPending}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review/Complete */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe Name</label>
              <p className="text-sm text-muted-foreground p-2 bg-muted rounded">{name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredients</label>
              {recipeIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingredients</p>
              ) : (
                <div className="space-y-1">
                  {recipeIngredients.map((ing) => (
                    <div
                      key={compositeKey(ing.source, ing.originalId)}
                      className="text-sm text-muted-foreground p-2 bg-muted rounded"
                    >
                      {ing.name} - {ing.quantity} {ing.unit}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              {selectedTagIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags selected</p>
              ) : (
                <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Picture</label>
              {selectedImageUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={selectedImageUrl}
                    alt="Selected recipe image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded">
                  <ImageIcon className="w-4 h-4" />
                  No image selected
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isPending}
          >
            Previous
          </Button>
        )}
        {currentStep < 5 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="flex-1"
          >
            {currentStep === 4 ? (selectedImageUrl ? "Next" : "Skip") : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Creating..." : "Create Recipe"}
          </Button>
        )}
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
