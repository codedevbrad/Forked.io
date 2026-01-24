"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { deleteShoppingListAction } from "@/src/domains/shop/db";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { ShoppingListItem } from "./shopping-list-item";

export function ShoppingListsList() {
  const { data: shoppingLists, isLoading, error, mutate } = useShoppingLists();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [recipeFilters, setRecipeFilters] = useState<Record<string, string>>({});

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await deleteShoppingListAction(itemToDelete);
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

  const handleRecipeFilterChange = (listId: string, recipeId: string) => {
    setRecipeFilters((prev) => ({
      ...prev,
      [listId]: recipeId,
    }));
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">
        Loading shopping lists...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading shopping lists. Please try again.
      </p>
    );
  }

  if (!shoppingLists || shoppingLists.length === 0) {
    return (
      <p className="text-muted-foreground">
        No shopping lists yet. Create your first shopping list to get started.
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Shopping List"
        description="Are you sure you want to delete this shopping list? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="space-y-4 grid grid-cols-2 gap-4">
        {shoppingLists.map((list) => (
          <div key={list.id}>

          <ShoppingListItem
            key={list.id}
            list={list}
            isEditing={editingId === list.id}
            selectedRecipeFilter={recipeFilters[list.id] || "all"}
            onEdit={() => setEditingId(list.id)}
            onDelete={() => handleDeleteClick(list.id)}
            onEditSuccess={handleEditSuccess}
            onEditCancel={() => setEditingId(null)}
            onRecipeFilterChange={(recipeId) =>
              handleRecipeFilterChange(list.id, recipeId)
            }
            isPending={isPending}
          />
          </div>
        ))}
      </div>
    </>
  );
}
