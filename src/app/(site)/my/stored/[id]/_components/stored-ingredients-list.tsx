"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { 
  removeIngredientFromStoredAction, 
  updateStoredIngredientAction 
} from "@/src/domains/stored/db";
import { useStoredLocation } from "@/src/domains/stored/_contexts/useStored";
import { Trash2, Pencil } from "lucide-react";
import { Unit } from "@prisma/client";
import { StoredIngredientForm } from "./stored-ingredient-form";

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
  storeLink: string | null;
};

type StoredIngredientsListProps = {
  storedId: string;
};

function getUnitLabel(unit: Unit): string {
  return unit;
}

export function StoredIngredientsList({ storedId }: StoredIngredientsListProps) {
  const { data: stored, error, isLoading, mutate } = useStoredLocation(storedId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (storedIngredientId: string) => {
    setItemToDelete(storedIngredientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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

  const handleEditSuccess = () => {
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">
        Loading ingredients...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading ingredients. Please try again.
      </p>
    );
  }

  const ingredients = stored?.ingredients || [];

  if (ingredients.length === 0) {
    return (
      <p className="text-muted-foreground">
        No ingredients stored here yet. Add your first ingredient to get started.
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Ingredient"
        description="Are you sure you want to remove this ingredient from storage? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="space-y-4">
        {ingredients.map((storedIngredient) => (
        <div key={storedIngredient.id}>
          {editingId === storedIngredient.id ? (
            <div className="p-4 border rounded-lg space-y-2">
              <StoredIngredientForm
                storedId={storedId}
                storedIngredientId={storedIngredient.id}
                initialIngredientId={storedIngredient.ingredientId}
                initialQuantity={storedIngredient.quantity}
                initialUnit={storedIngredient.unit}
                initialExpiresAt={storedIngredient.expiresAt}
                initialStoreLink={storedIngredient.storeLink}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{storedIngredient.ingredient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {storedIngredient.quantity} {getUnitLabel(storedIngredient.unit)}
                  </p>
                  {storedIngredient.expiresAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(storedIngredient.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  {storedIngredient.storeLink && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <a 
                        href={storedIngredient.storeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Store Link
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(storedIngredient.id)}
                    disabled={isPending}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(storedIngredient.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
}
