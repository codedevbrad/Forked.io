"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { updateStoredIngredientAction } from "@/src/domains/stored/db";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { Unit } from "@prisma/client";

type StoredIngredientFormProps = {
  storedId: string;
  storedIngredientId: string;
  initialIngredientId: string;
  initialQuantity: number;
  initialUnit: Unit;
  initialExpiresAt: Date | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function StoredIngredientForm({
  storedId,
  storedIngredientId,
  initialIngredientId,
  initialQuantity,
  initialUnit,
  initialExpiresAt,
  onSuccess,
  onCancel,
}: StoredIngredientFormProps) {
  const { mutate } = useStored();
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [expiresAt, setExpiresAt] = useState(
    initialExpiresAt ? new Date(initialExpiresAt).toISOString().split("T")[0] : ""
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuantity(initialQuantity.toString());
    setUnit(initialUnit);
    setExpiresAt(
      initialExpiresAt ? new Date(initialExpiresAt).toISOString().split("T")[0] : ""
    );
  }, [initialQuantity, initialUnit, initialExpiresAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    startTransition(async () => {
      const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
      const result = await updateStoredIngredientAction(
        storedIngredientId,
        quantityNum,
        unit,
        expiresAtDate
      );

      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Updating..." : "Update"}
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
