"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createShoppingListAction, updateShoppingListAction, ShoppingListIngredientInput } from "@/src/domains/shop/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { Unit } from "@prisma/client";
import { Plus, X } from "lucide-react";

type ShoppingListIngredientFormData = {
  ingredientId: string;
  quantity: string;
  unit: Unit;
};

type ShoppingListFormProps = {
  shoppingListId?: string;
  initialName?: string;
  initialIngredients?: Array<{
    ingredientId: string;
    ingredient: { id: string; name: string };
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

export function ShoppingListForm({ 
  shoppingListId, 
  initialName = "", 
  initialIngredients = [],
  initialRecipes = [],
  onSuccess,
  onCancel 
}: ShoppingListFormProps) {
  const { data: ingredients } = useIngredients();
  const { data: recipes } = useRecipes();
  const { mutate } = useShoppingLists();
  const [name, setName] = useState(initialName);
  const [listIngredients, setListIngredients] = useState<ShoppingListIngredientFormData[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(initialRecipes.map(r => r.id));
  const [recipeSelectKey, setRecipeSelectKey] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!shoppingListId;
  const prevShoppingListIdRef = useRef<string | undefined>(shoppingListId);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Only sync state when shoppingListId changes (switching to edit a different shopping list)
    // or on initial mount. This prevents resetting the form while user is typing.
    const shoppingListIdChanged = prevShoppingListIdRef.current !== shoppingListId;
    
    if (shoppingListIdChanged || isInitialMountRef.current) {
      prevShoppingListIdRef.current = shoppingListId;
      isInitialMountRef.current = false;
      setName(initialName);
      setListIngredients(
        initialIngredients.length > 0
          ? initialIngredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity.toString(),
              unit: ing.unit,
            }))
          : []
      );
      setSelectedRecipeIds(initialRecipes.map(r => r.id));
    }
  }, [shoppingListId, initialName, initialIngredients, initialRecipes]);

  const addIngredient = () => {
    setListIngredients([
      ...listIngredients,
      { ingredientId: "", quantity: "", unit: Unit.g },
    ]);
  };

  const removeIngredient = (index: number) => {
    setListIngredients(listIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof ShoppingListIngredientFormData, value: string | Unit) => {
    const updated = [...listIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setListIngredients(updated);
  };

  const handleRecipeSelect = (recipeId: string) => {
    if (!recipeId || selectedRecipeIds.includes(recipeId)) {
      setRecipeSelectKey(prev => prev + 1); // Reset select
      return;
    }

    const recipe = recipes?.find(r => r.id === recipeId);
    if (!recipe) {
      setRecipeSelectKey(prev => prev + 1); // Reset select
      return;
    }

    // Add recipe to selected list
    setSelectedRecipeIds([...selectedRecipeIds, recipeId]);
    setRecipeSelectKey(prev => prev + 1); // Reset select after adding

    // Add recipe ingredients to the list, merging with existing ingredients
    const newIngredients = [...listIngredients];
    
    recipe.ingredients.forEach((recipeIng) => {
      // Check if ingredient already exists
      const existingIndex = newIngredients.findIndex(
        ing => ing.ingredientId === recipeIng.ingredientId
      );

      if (existingIndex >= 0) {
        // Merge quantities if same unit, otherwise add as new entry
        const existing = newIngredients[existingIndex];
        if (existing.unit === recipeIng.unit) {
          const existingQty = parseFloat(existing.quantity) || 0;
          const newQty = existingQty + recipeIng.quantity;
          newIngredients[existingIndex] = {
            ...existing,
            quantity: newQty.toString(),
          };
        } else {
          // Different units, add as separate entry
          newIngredients.push({
            ingredientId: recipeIng.ingredientId,
            quantity: recipeIng.quantity.toString(),
            unit: recipeIng.unit,
          });
        }
      } else {
        // New ingredient
        newIngredients.push({
          ingredientId: recipeIng.ingredientId,
          quantity: recipeIng.quantity.toString(),
          unit: recipeIng.unit,
        });
      }
    });

    setListIngredients(newIngredients);
  };

  const handleRecipeRemove = (recipeId: string) => {
    setSelectedRecipeIds(selectedRecipeIds.filter(id => id !== recipeId));
    // Note: We don't remove ingredients here as they might have been manually edited
    // The user can manually remove ingredients if needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Shopping list name is required");
      return;
    }

    // Validate and convert ingredients
    const validIngredients: ShoppingListIngredientInput[] = [];
    for (const ing of listIngredients) {
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
      const result = isEditing
        ? await updateShoppingListAction(shoppingListId, name, validIngredients, selectedRecipeIds)
        : await createShoppingListAction(name, validIngredients, selectedRecipeIds);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setListIngredients([]);
        setSelectedRecipeIds([]);
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              {recipes?.filter(r => !selectedRecipeIds.includes(r.id)).map((recipe) => (
                <SelectItem key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </SelectItem>
              ))}
              {(!recipes || recipes.length === 0 || recipes.filter(r => !selectedRecipeIds.includes(r.id)).length === 0) && (
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
                const recipe = recipes?.find(r => r.id === recipeId);
                if (!recipe) return null;
                return (
                  <div
                    key={recipeId}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                  >
                    <span>{recipe.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRecipeRemove(recipeId)}
                      disabled={isPending}
                      className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

        {listIngredients.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No ingredients added. Click "Add" to add ingredients to this shopping list.
          </p>
        )}

        <div className="space-y-2">
          {listIngredients.map((ing, index) => (
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
                        {ingredient.name}
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

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Shopping List" : "Create Shopping List")
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
