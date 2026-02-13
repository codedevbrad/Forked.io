"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createShoppingListAction, updateShoppingListAction, ShoppingListIngredientInput } from "@/src/domains/shop/db";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { IngredientPicker, PickedIngredient, IngredientSource } from "@/src/domains/ingredients/_components/ingredient-picker";
import { Unit } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { X, ChevronDown } from "lucide-react";

type SelectedIngredient = {
  rowId: string;        // unique key per row (for React key & row operations)
  source: IngredientSource;
  id: string;           // user Ingredient id or ShopIngredient id
  name: string;
  quantity: string;
  unit: Unit;
  contributions: number; // how many recipe additions were merged into this row
};

function genRowId() {
  return Math.random().toString(36).slice(2, 10);
}

function compositeKey(source: IngredientSource, id: string) {
  return `${source}:${id}`;
}

function mergeKey(source: IngredientSource, id: string, unit: Unit) {
  return `${source}:${id}:${unit}`;
}

type ShoppingListFormProps = {
  shoppingListId?: string;
  initialName?: string;
  initialIngredients?: Array<{
    ingredientId?: string | null;
    ingredient?: {
      id: string;
      shopIngredient?: { name: string } | null;
      customUserIngredient?: { name: string } | null;
    } | null;
    shopIngredientId?: string | null;
    shopIngredient?: { id: string; name: string } | null;
    quantity: number;
    unit: Unit;
  }>;
  initialRecipes?: Array<{
    id: string;
    name: string;
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function resolveInitialIngredients(
  items: NonNullable<ShoppingListFormProps["initialIngredients"]>
): SelectedIngredient[] {
  return items.map((ing) => {
    if (ing.shopIngredientId && ing.shopIngredient) {
      return {
        rowId: genRowId(),
        source: "shop" as const,
        id: ing.shopIngredientId,
        name: ing.shopIngredient.name,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
        contributions: 1,
      };
    }
    const name =
      ing.ingredient?.shopIngredient?.name ??
      ing.ingredient?.customUserIngredient?.name ??
      "Unnamed";
    return {
      rowId: genRowId(),
      source: "user" as const,
      id: ing.ingredientId ?? "",
      name,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
      contributions: 1,
    };
  });
}

export function ShoppingListForm({
  shoppingListId,
  initialName = "",
  initialIngredients = [],
  initialRecipes = [],
  onSuccess,
  onCancel,
}: ShoppingListFormProps) {
  const { data: recipes } = useRecipes();
  const { mutate } = useShoppingLists();
  const [name, setName] = useState(initialName);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
    initialRecipes.map((r) => r.id)
  );
  const [recipeSelectKey, setRecipeSelectKey] = useState(0);
  const [pendingRemoveRecipeId, setPendingRemoveRecipeId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!shoppingListId;
  const prevShoppingListIdRef = useRef<string | undefined>(shoppingListId);
  const isInitialMountRef = useRef(true);

  // Sync initial data on mount or when editing a different list
  useEffect(() => {
    const idChanged = prevShoppingListIdRef.current !== shoppingListId;
    if (idChanged || isInitialMountRef.current) {
      prevShoppingListIdRef.current = shoppingListId;
      isInitialMountRef.current = false;
      setName(initialName);
      setIngredients(
        initialIngredients.length > 0
          ? resolveInitialIngredients(initialIngredients)
          : []
      );
      setSelectedRecipeIds(initialRecipes.map((r) => r.id));
    }
  }, [shoppingListId, initialName, initialIngredients, initialRecipes]);

  // Build the selected set for the picker
  const selectedSet = new Set(
    ingredients.map((ing) => compositeKey(ing.source, ing.id))
  );

  // Picker toggle handler
  const handlePickerToggle = useCallback(
    (item: PickedIngredient) => {
      const key = compositeKey(item.source, item.id);
      setIngredients((prev) => {
        const exists = prev.some(
          (i) => compositeKey(i.source, i.id) === key
        );
        if (exists) {
          // Remove all rows for this ingredient
          return prev.filter(
            (i) => compositeKey(i.source, i.id) !== key
          );
        }
        // Add with defaults
        return [
          ...prev,
          {
            rowId: genRowId(),
            source: item.source,
            id: item.id,
            name: item.name,
            quantity: "1",
            unit: Unit.piece,
            contributions: 1,
          },
        ];
      });
    },
    []
  );

  const removeIngredient = (rowId: string) => {
    setIngredients((prev) => prev.filter((i) => i.rowId !== rowId));
  };

  // --- Recipe handling ---

  const handleRecipeSelect = (recipeId: string) => {
    if (!recipeId || selectedRecipeIds.includes(recipeId)) {
      setRecipeSelectKey((prev) => prev + 1);
      return;
    }

    const recipe = recipes?.find((r) => r.id === recipeId);
    if (!recipe) {
      setRecipeSelectKey((prev) => prev + 1);
      return;
    }

    setSelectedRecipeIds([...selectedRecipeIds, recipeId]);
    setRecipeSelectKey((prev) => prev + 1);

    // Merge recipe ingredients into the selected list
    setIngredients((prev) => {
      const next = [...prev];
      recipe.ingredients.forEach((recipeIng) => {
        const mk = mergeKey("user", recipeIng.ingredientId, recipeIng.unit);
        const existingIdx = next.findIndex(
          (i) => mergeKey(i.source, i.id, i.unit) === mk
        );

        // Resolve name from the recipe's included ingredient relation
        const ingredientName =
          recipeIng.ingredient?.shopIngredient?.name ??
          recipeIng.ingredient?.customUserIngredient?.name ??
          "Unnamed";

        if (existingIdx >= 0) {
          // Same ingredient + same unit → merge quantities
          const existing = next[existingIdx];
          const qty = parseFloat(existing.quantity) || 0;
          next[existingIdx] = {
            ...existing,
            quantity: (qty + recipeIng.quantity).toString(),
            contributions: existing.contributions + 1,
          };
        } else {
          // New ingredient or different unit → new row with unique key
          next.push({
            rowId: genRowId(),
            source: "user",
            id: recipeIng.ingredientId,
            name: ingredientName,
            quantity: recipeIng.quantity.toString(),
            unit: recipeIng.unit,
            contributions: 1,
          });
        }
      });
      return next;
    });
  };

  const handleRecipeRemoveKeepIngredients = (recipeId: string) => {
    setSelectedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
    setPendingRemoveRecipeId(null);
  };

  const handleRecipeRemoveWithIngredients = (recipeId: string) => {
    setSelectedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
    setPendingRemoveRecipeId(null);

    const recipe = recipes?.find((r) => r.id === recipeId);
    if (!recipe) return;

    setIngredients((prev) => {
      const next = [...prev];
      recipe.ingredients.forEach((recipeIng) => {
        const mk = mergeKey("user", recipeIng.ingredientId, recipeIng.unit);
        const idx = next.findIndex(
          (i) => mergeKey(i.source, i.id, i.unit) === mk
        );
        if (idx >= 0) {
          const existing = next[idx];
          const newQty = parseFloat(existing.quantity) - recipeIng.quantity;
          const newContributions = existing.contributions - 1;
          if (newQty <= 0 || newContributions <= 0) {
            // Fully contributed by this recipe (or quantity zeroed out) → remove row
            next.splice(idx, 1);
          } else {
            next[idx] = {
              ...existing,
              quantity: newQty.toString(),
              contributions: newContributions,
            };
          }
        }
      });
      return next;
    });
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Shopping list name is required");
      return;
    }

    const validIngredients: ShoppingListIngredientInput[] = [];
    for (const ing of ingredients) {
      if (!ing.id || !ing.quantity) continue;
      const quantity = parseFloat(ing.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError("All ingredient quantities must be valid positive numbers");
        return;
      }
      validIngredients.push({
        ...(ing.source === "user"
          ? { ingredientId: ing.id }
          : { shopIngredientId: ing.id }),
        quantity,
        unit: ing.unit,
      });
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateShoppingListAction(
            shoppingListId,
            name,
            validIngredients,
            selectedRecipeIds
          )
        : await createShoppingListAction(
            name,
            validIngredients,
            selectedRecipeIds
          );

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setIngredients([]);
        setSelectedRecipeIds([]);
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Shopping List Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., Weekly Groceries, Party Shopping"
          autoFocus
        />
      </div>

      {/* Recipes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipes</label>
        <div className="space-y-2">
          <Select
            key={recipeSelectKey}
            value=""
            onValueChange={handleRecipeSelect}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a recipe to add ingredients" />
            </SelectTrigger>
            <SelectContent>
              {recipes
                ?.filter((r) => !selectedRecipeIds.includes(r.id))
                .map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              {(!recipes ||
                recipes.length === 0 ||
                recipes.filter((r) => !selectedRecipeIds.includes(r.id))
                  .length === 0) && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {!recipes || recipes.length === 0
                    ? "No recipes available"
                    : "All recipes added"}
                </div>
              )}
            </SelectContent>
          </Select>

          {selectedRecipeIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedRecipeIds.map((recipeId) => {
                const recipe = recipes?.find((r) => r.id === recipeId);
                if (!recipe) return null;
                return (
                  <Popover
                    key={recipeId}
                    open={pendingRemoveRecipeId === recipeId}
                    onOpenChange={(open) => {
                      if (!open) setPendingRemoveRecipeId(null);
                    }}
                  >
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm">
                      <span>{recipe.name}</span>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingRemoveRecipeId(recipeId)}
                          disabled={isPending}
                          className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-64" align="start">
                      <p className="text-sm mb-3">
                        Remove ingredients from{" "}
                        <strong>{recipe.name}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRecipeRemoveWithIngredients(recipeId)
                          }
                          className="flex-1"
                        >
                          Remove
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRecipeRemoveKeepIngredients(recipeId)
                          }
                          className="flex-1"
                        >
                          Keep
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Picker (collapsible) */}
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
          {ingredients.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({ingredients.length} selected)
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

      {/* Selected ingredients with qty / unit */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Selected Ingredients ({ingredients.length})
        </label>

        {ingredients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click ingredients above to add them to your list.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {ingredients.map((ing) => (
              <div
                key={ing.rowId}
                className="flex items-center justify-between gap-1 border rounded-md px-2 py-1.5 text-sm"
              >
                <span className="truncate font-medium">
                  {ing.name}
                  <span className="ml-1 text-muted-foreground font-normal">
                    {ing.quantity} {ing.unit}
                  </span>
                  {ing.contributions > 1 && (
                    <span className="ml-1 text-xs text-muted-foreground font-normal">
                      (x{ing.contributions})
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(ing.rowId)}
                  disabled={isPending}
                  className="h-5 w-5 p-0 shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Shopping List"
              : "Create Shopping List"}
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
