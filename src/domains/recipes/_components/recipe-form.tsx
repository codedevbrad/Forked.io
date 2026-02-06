"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createRecipeAction, RecipeIngredientInput } from "@/src/domains/recipes/db";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { TagSelector } from "@/src/domains/ingredients/_components/tag-selector";
import { Unit } from "@prisma/client";
import { Plus, X, CheckCircle2, Circle, ChevronRight } from "lucide-react";

type RecipeIngredientFormData = {
  ingredientId: string;
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

export function RecipeForm({ 
  initialName = "", 
  initialTags = [],
  onSuccess,
  onCancel 
}: RecipeFormProps) {
  const { data: ingredients } = useIngredients();
  const { mutate } = useRecipes();
  const [name, setName] = useState(initialName);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientFormData[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTags.map(tag => tag.id));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const addIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId: "", quantity: "", unit: Unit.g },
    ]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredientFormData, value: string | Unit) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      setError("Recipe name is required");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    // Check if at least one ingredient is added
    const hasIngredients = recipeIngredients.length > 0;
    if (!hasIngredients) {
      setError("At least one ingredient is required");
      return false;
    }

    // Validate all ingredients are complete
    for (const ing of recipeIngredients) {
      if (!ing.ingredientId || !ing.quantity) {
        setError("All ingredients must have an ingredient and quantity selected");
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
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // Tags step - no validation needed, tags are optional
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    setError("");
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Only allow submission on step 4
    if (currentStep !== 4) {
      return;
    }

    // Final validation
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    // Validate and convert ingredients
    const validIngredients: RecipeIngredientInput[] = [];
    for (const ing of recipeIngredients) {
      if (!ing.ingredientId || !ing.quantity) {
        continue; // Skip incomplete ingredients
      }
      const quantity = parseFloat(ing.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError("All ingredient quantities must be valid positive numbers");
        return;
      }
      validIngredients.push({
        ingredientId: ing.ingredientId,
        quantity,
        unit: ing.unit,
      });
    }

    startTransition(async () => {
      const result = await createRecipeAction(name, validIngredients, selectedTagIds);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setRecipeIngredients([]);
        setSelectedTagIds([]);
        setCurrentStep(1);
        await mutate();
        onSuccess?.();
      }
    });
  };

  // Show 4-step wizard for recipe creation
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between w-full">
        {/* Step 1: Recipe Name */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            {currentStep > 1 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : currentStep === 1 ? (
              <Circle className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`text-sm ${currentStep === 1 ? "font-medium" : currentStep > 1 ? "text-muted-foreground" : "text-muted-foreground"}`}>
              Recipe Name
            </span>
          </div>
          {currentStep < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
        </div>

        {/* Step 2: Ingredients */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            {currentStep > 2 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : currentStep === 2 ? (
              <Circle className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`text-sm ${currentStep === 2 ? "font-medium" : currentStep > 2 ? "text-muted-foreground" : "text-muted-foreground"}`}>
              Ingredients
            </span>
          </div>
          {currentStep < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
        </div>

        {/* Step 3: Tags */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            {currentStep > 3 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : currentStep === 3 ? (
              <Circle className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`text-sm ${currentStep === 3 ? "font-medium" : currentStep > 3 ? "text-muted-foreground" : "text-muted-foreground"}`}>
              Tags
            </span>
          </div>
          {currentStep < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
        </div>

        {/* Step 4: Complete */}
        <div className="flex items-center gap-2 flex-1">
          {currentStep === 4 ? (
            <Circle className="w-5 h-5 text-primary fill-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
          <span className={`text-sm ${currentStep === 4 ? "font-medium" : "text-muted-foreground"}`}>
            Complete
          </span>
        </div>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ingredients</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {recipeIngredients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ingredients added. Click &quot;Add&quot; to add ingredients to this recipe.
              </p>
            )}

            <div className="space-y-2">
              {recipeIngredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={ing.ingredientId}
                      onValueChange={(value) => updateIngredient(index, "ingredientId", value)}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients?.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {getIngredientDisplayName(ingredient)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      placeholder="Qty"
                      disabled={isPending}
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={ing.unit}
                      onValueChange={(value) => updateIngredient(index, "unit", value as Unit)}
                      disabled={isPending}
                    >
                      <SelectTrigger>
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
                    onClick={() => removeIngredient(index)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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

        {/* Step 4: Review/Complete */}
        {currentStep === 4 && (
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
                  {recipeIngredients.map((ing, index) => {
                    const ingredient = ingredients?.find(i => i.id === ing.ingredientId);
                    return (
                      <div key={index} className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {ingredient?.name || "Unknown"} - {ing.quantity} {ing.unit}
                      </div>
                    );
                  })}
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
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="flex-1"
          >
            Next
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
