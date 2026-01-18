"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createRecipeAction, updateRecipeAction, RecipeIngredientInput } from "@/src/domains/recipes/db";
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

type RecipeFormProps = {
  recipeId?: string;
  initialName?: string;
  initialIngredients?: Array<{
    ingredientId: string;
    ingredient: { id: string; name: string };
    quantity: number;
    unit: Unit;
  }>;
  initialTags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function RecipeForm({ 
  recipeId, 
  initialName = "", 
  initialIngredients = [],
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
  const isEditing = !!recipeId;
  const prevRecipeIdRef = useRef<string | undefined>(recipeId);

  useEffect(() => {
    // Only sync when recipeId changes (switching to edit a different recipe)
    if (prevRecipeIdRef.current !== recipeId) {
      prevRecipeIdRef.current = recipeId;
      // Sync state only when switching to a different recipe
      setName(initialName);
      setRecipeIngredients(
        initialIngredients.length > 0
          ? initialIngredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity.toString(),
              unit: ing.unit,
            }))
          : []
      );
      setSelectedTagIds(initialTags.map(tag => tag.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]); // Only depend on recipeId - initialName/initialIngredients are captured when ID changes

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Recipe name is required");
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
      const result = isEditing
        ? await updateRecipeAction(recipeId, name, validIngredients, selectedTagIds)
        : await createRecipeAction(name, validIngredients, selectedTagIds);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setRecipeIngredients([]);
        setSelectedTagIds([]);
        await mutate();
        onSuccess?.();
      }
    });
  };

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
          {isPending 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Recipe" : "Create Recipe")
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
