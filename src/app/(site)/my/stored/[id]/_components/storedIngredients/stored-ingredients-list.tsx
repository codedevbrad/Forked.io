"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { removeIngredientFromStoredAction } from "@/src/domains/stored/db";
import { useStoredLocation } from "@/src/domains/stored/_contexts/useStored";
import { IngredientCard } from "@/src/domains/ingredients/_components/ingredient";
import { StoredIngredientForm } from "../stored-ingredient-form";
import { StoredIngredientDetails } from "./stored-ingredient-details";
import { StoredIngredientCardActions } from "./stored-ingredient-card-actions";

type StoredIngredientsListProps = {
  storedId: string;
};

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
      <p className="text-muted-foreground">Loading ingredients...</p>
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
            <IngredientCard
              ingredient={storedIngredient.ingredient}
              className="p-4"
              isEditing={editingId === storedIngredient.id}
              editComponent={
                editingId === storedIngredient.id ? (
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
                ) : undefined
              }
              actions={
                editingId !== storedIngredient.id ? (
                  <StoredIngredientCardActions
                    onEdit={() => setEditingId(storedIngredient.id)}
                    onDelete={() => handleDeleteClick(storedIngredient.id)}
                    isPending={isPending}
                  />
                ) : undefined
              }
            >
              {editingId !== storedIngredient.id && (
                <StoredIngredientDetails
                  quantity={storedIngredient.quantity}
                  unit={storedIngredient.unit}
                  expiresAt={storedIngredient.expiresAt}
                  storeLink={storedIngredient.storeLink}
                />
              )}
            </IngredientCard>
          </div>
        ))}
      </div>
    </>
  );
}
