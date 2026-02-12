"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { updateRecipeAction, getRecipeAction, RecipeIngredientInput } from "@/src/domains/recipes/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { TagSelector } from "@/src/domains/ingredients/_components/tag-selector";
import { Unit } from "@prisma/client";
import { Plus, X } from "lucide-react";

type RecipeIngredientFormData = {
  ingredientId: string;
  quantity: string;
  unit: Unit;
};

type RecipeFormEditProps = {
  recipeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function RecipeFormEdit({ 
  recipeId, 
  onSuccess,
  onCancel 
}: RecipeFormEditProps) {
  const { data: ingredients } = useIngredients();
  const { mutate } = useRecipes();
  const [name, setName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientFormData[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isCancelled = false;

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const recipe = await getRecipeAction(recipeId);
        
        if (isCancelled) return;

        if (!recipe) {
          setError("Recipe not found");
          setIsLoading(false);
          return;
        }

        setName(recipe.name);
        setRecipeIngredients(
          recipe.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity.toString(),
            unit: ing.unit,
          }))
        );
        setSelectedTagIds(recipe.tags?.map(tag => tag.id) || []);
      } catch {
        if (!isCancelled) {
          setError("Failed to load recipe");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRecipe();

    return () => {
      isCancelled = true;
    };
  }, [recipeId]);

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

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Recipe name is required");
      return false;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
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
      const result = await updateRecipeAction(recipeId, name, validIngredients, selectedTagIds);

      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        onSuccess?.();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive bg-destructive/10 p-4 rounded">
          {error}
        </div>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
          >
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <TagSelector
        selectedTagIds={selectedTagIds}
        onSelectionChange={setSelectedTagIds}
        disabled={isPending}
      />

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Updating..." : "Update Recipe"}
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
