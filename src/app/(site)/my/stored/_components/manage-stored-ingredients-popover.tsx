"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { 
  addIngredientToStoredAction, 
  removeIngredientFromStoredAction 
} from "@/src/domains/stored/db";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { Unit } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";

type StoredIngredient = {
  id: string;
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: Unit;
  expiresAt: Date | null;
};

type ManageStoredIngredientsPopoverProps = {
  storedId: string;
  storedName: string;
  ingredients: StoredIngredient[];
};

function getUnitLabel(unit: Unit): string {
  return unit;
}

export function ManageStoredIngredientsPopover({
  storedId,
  storedName,
  ingredients,
}: ManageStoredIngredientsPopoverProps) {
  const [open, setOpen] = useState(false);
  const { data: allIngredients, isLoading: ingredientsLoading } = useIngredients();
  const { mutate } = useStored();
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>(Unit.g);
  const [expiresAt, setExpiresAt] = useState("");
  const [storeLink, setStoreLink] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Get ingredients that are not already in this storage
  const availableIngredients = allIngredients?.filter(
    (ing) => !ingredients.some((si) => si.ingredientId === ing.id)
  ) || [];

  const handleAddIngredient = async (e: React.FormEvent) => {
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
        await mutate();
      }
    });
  };

  const handleRemoveIngredientClick = (storedIngredientId: string) => {
    setItemToDelete(storedIngredientId);
    setDeleteDialogOpen(true);
  };

  const handleRemoveIngredientConfirm = async () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await removeIngredientFromStoredAction(itemToDelete);
      if (result.success) {
        await mutate();
      } else {
        alert(result.error);
      }
      setItemToDelete(null);
    });
  };

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Ingredient"
        description="Are you sure you want to remove this ingredient from storage? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveIngredientConfirm}
        variant="destructive"
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Manage ingredients">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-96 max-w-[calc(100%-2rem)] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Ingredients</DialogTitle>
            <DialogDescription>
              {storedName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">

          {/* Existing Ingredients */}
          {ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Ingredients</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ingredients.map((si) => (
                  <div
                    key={si.id}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{getIngredientDisplayName(si.ingredient)}</div>
                      <div className="text-xs text-muted-foreground">
                        {si.quantity} {getUnitLabel(si.unit)}
                        {si.expiresAt && (
                          <span className="ml-2">
                            • Expires: {new Date(si.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIngredientClick(si.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Ingredient */}
          {availableIngredients.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-medium">Add Ingredient</h4>
              <form onSubmit={handleAddIngredient} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="ingredient" className="text-xs font-medium">
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
                      {availableIngredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {getIngredientDisplayName(ingredient)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-xs font-medium">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="unit" className="text-xs font-medium">
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
                </div>
                <div className="space-y-2">
                  <label htmlFor="expiresAt" className="text-xs font-medium">
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
                  <label htmlFor="storeLink" className="text-xs font-medium">
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
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isPending || !ingredientId}
                  className="w-full"
                  size="sm"
                >
                  {isPending ? "Adding..." : "Add Ingredient"}
                </Button>
              </form>
            </div>
          )}

          {availableIngredients.length === 0 && ingredients.length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              All available ingredients are already in this storage
            </p>
          )}

          {availableIngredients.length === 0 && ingredients.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No ingredients available. Create ingredients first.
            </p>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
