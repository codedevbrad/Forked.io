"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createShoppingListAction, updateShoppingListAction, ShoppingListIngredientInput } from "@/src/domains/shop/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
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
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ShoppingListForm({ 
  shoppingListId, 
  initialName = "", 
  initialIngredients = [],
  onSuccess,
  onCancel 
}: ShoppingListFormProps) {
  const { data: ingredients } = useIngredients();
  const { mutate } = useShoppingLists();
  const [name, setName] = useState(initialName);
  const [listIngredients, setListIngredients] = useState<ShoppingListIngredientFormData[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!shoppingListId;
  const prevShoppingListIdRef = useRef<string | undefined>(shoppingListId);

  useEffect(() => {
    // Only sync when shoppingListId changes (switching to edit a different shopping list)
    if (prevShoppingListIdRef.current !== shoppingListId) {
      prevShoppingListIdRef.current = shoppingListId;
      // Sync state only when switching to a different shopping list
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingListId]); // Only depend on shoppingListId - initialName/initialIngredients are captured when ID changes

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
        ? await updateShoppingListAction(shoppingListId, name, validIngredients)
        : await createShoppingListAction(name, validIngredients);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setListIngredients([]);
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
