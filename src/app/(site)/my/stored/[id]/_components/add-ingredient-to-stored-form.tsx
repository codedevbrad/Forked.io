"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { addIngredientToStoredAction } from "@/src/domains/stored/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useStoredLocation, useStored } from "@/src/domains/stored/_contexts/useStored";
import { Unit } from "@prisma/client";

type AddIngredientToStoredFormProps = {
  storedId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AddIngredientToStoredForm({
  storedId,
  onSuccess,
  onCancel,
}: AddIngredientToStoredFormProps) {
  const { data: ingredients, isLoading: ingredientsLoading } = useIngredients();
  const { mutate: mutateLocation } = useStoredLocation(storedId);
  const { mutate: mutateAll } = useStored();
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>(Unit.g);
  const [expiresAt, setExpiresAt] = useState("");
  const [storeLink, setStoreLink] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ingredientId) {
      setError("Please select an ingredient");
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    startTransition(async () => {
      const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
      const result = await addIngredientToStoredAction(
        storedId,
        ingredientId,
        quantityNum,
        unit,
        expiresAtDate,
        storeLink || null
      );

      if (!result.success) {
        setError(result.error);
      } else {
        setIngredientId("");
        setQuantity("");
        setUnit(Unit.g);
        setExpiresAt("");
        setStoreLink("");
        await mutateLocation();
        await mutateAll();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="ingredient" className="text-sm font-medium">
          Ingredient
        </label>
        <Select
          value={ingredientId}
          onValueChange={setIngredientId}
          disabled={isPending || ingredientsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an ingredient" />
          </SelectTrigger>
          <SelectContent>
            {ingredients && ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.id}>
                  {getIngredientDisplayName(ingredient)}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No ingredients available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          step="0.01"
          min="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., 500"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="unit" className="text-sm font-medium">
          Unit
        </label>
        <Select
          value={unit}
          onValueChange={(value) => setUnit(value as Unit)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Unit.g}>g</SelectItem>
            <SelectItem value={Unit.kg}>kg</SelectItem>
            <SelectItem value={Unit.ml}>ml</SelectItem>
            <SelectItem value={Unit.l}>l</SelectItem>
            <SelectItem value={Unit.tbsp}>tbsp</SelectItem>
            <SelectItem value={Unit.tsp}>tsp</SelectItem>
            <SelectItem value={Unit.piece}>piece</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="expiresAt" className="text-sm font-medium">
          Expiration Date (optional)
        </label>
        <Input
          id="expiresAt"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="storeLink" className="text-sm font-medium">
          Store Link (optional)
        </label>
        <Input
          id="storeLink"
          type="url"
          value={storeLink}
          onChange={(e) => setStoreLink(e.target.value)}
          disabled={isPending}
          placeholder="e.g., https://store.com/product"
        />
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !ingredientId} className="flex-1">
          {isPending ? "Adding..." : "Add Ingredient"}
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
