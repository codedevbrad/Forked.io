"use client";

import { useState, useTransition, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { updateRecipeAction, getRecipeAction, RecipeIngredientInput } from "@/src/domains/recipes/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { ensureIngredientForShopAction } from "@/src/domains/ingredients/db";
import {
  IngredientPicker,
  PickedIngredient,
  IngredientSource,
  compositeKey,
} from "@/src/domains/ingredients/_components/ingredient-picker";
import { TagSelector } from "@/src/domains/ingredients/_components/tag-selector";
import { Unit } from "@prisma/client";
import { X } from "lucide-react";

type SelectedIngredient = {
  source: IngredientSource;
  originalId: string;
  ingredientId: string;
  name: string;
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
  const { data: ingredients, mutate: mutateIngredients } = useIngredients();
  const { mutate } = useRecipes();
  const [name, setName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const ingredientsRef = useRef(ingredients);
  ingredientsRef.current = ingredients;

  const shopToIngredientMap = useMemo(() => {
    const map = new Map<string, { ingredientId: string; name: string }>();
    ingredients?.forEach((ui) => {
      if (ui.shopIngredientId) {
        map.set(ui.shopIngredientId, {
          ingredientId: ui.id,
          name: getIngredientDisplayName(ui),
        });
      }
    });
    return map;
  }, [ingredients]);

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

        const currentIngredients = ingredientsRef.current;
        setName(recipe.name);
        setRecipeIngredients(
          recipe.ingredients.map((ing) => {
            const userIng = currentIngredients?.find(ui => ui.id === ing.ingredientId);
            if (userIng?.shopIngredientId) {
              return {
                source: "shop" as IngredientSource,
                originalId: userIng.shopIngredientId,
                ingredientId: ing.ingredientId,
                name: getIngredientDisplayName(userIng),
                quantity: ing.quantity.toString(),
                unit: ing.unit,
              };
            }
            return {
              source: "user" as IngredientSource,
              originalId: ing.ingredientId,
              ingredientId: ing.ingredientId,
              name: userIng ? getIngredientDisplayName(userIng) : "Unknown ingredient",
              quantity: ing.quantity.toString(),
              unit: ing.unit,
            };
          })
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

  const selectedSet = useMemo(
    () => new Set(recipeIngredients.map((i) => compositeKey(i.source, i.originalId))),
    [recipeIngredients]
  );

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

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Recipe name is required");
      return false;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const validIngredients: RecipeIngredientInput[] = [];

      for (const ing of recipeIngredients) {
        const quantity = parseFloat(ing.quantity);
        if (isNaN(quantity) || quantity <= 0) continue;

        let ingredientId = ing.ingredientId;

        if (!ingredientId && ing.source === "shop") {
          const result = await ensureIngredientForShopAction(ing.originalId);
          if (!result.success) {
            setError(result.error);
            return;
          }
          ingredientId = result.data!.id;
        }

        if (!ingredientId) continue;

        validIngredients.push({ ingredientId, quantity, unit: ing.unit });
      }

      const result = await updateRecipeAction(recipeId, name, validIngredients, selectedTagIds);

      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        await mutateIngredients();
        onSuccess?.();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-1/2 border-r p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="w-1/2 p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="p-4 space-y-4">
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
    <form onSubmit={handleSubmit} className="flex h-full">
      {/* Left panel: Ingredient Picker */}
      <div className="w-1/2 border-r p-4 overflow-y-auto">
        <label className="text-sm font-medium mb-3 block">
          Browse Ingredients
          {recipeIngredients.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal ml-2">
              ({recipeIngredients.length} selected)
            </span>
          )}
        </label>
        <IngredientPicker
          selected={selectedSet}
          onToggle={handlePickerToggle}
          disabled={isPending}
        />
      </div>

      {/* Right panel: Form fields */}
      <div className="w-1/2 p-4 overflow-y-auto space-y-4">
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
          <label className="text-sm font-medium">
            Selected Ingredients ({recipeIngredients.length})
          </label>

          {recipeIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Click ingredients on the left to add them to this recipe.
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
      </div>
    </form>
  );
}
