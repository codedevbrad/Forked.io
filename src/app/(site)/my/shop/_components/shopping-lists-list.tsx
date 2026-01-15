"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { ShoppingListForm } from "@/src/domains/shop/_components/shopping-list-form";
import { deleteShoppingListAction } from "@/src/domains/shop/db";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { Trash2, Pencil } from "lucide-react";
import { Unit } from "@prisma/client";

type ShoppingListIngredient = {
  id: string;
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: Unit;
};

type ShoppingList = {
  id: string;
  name: string;
  ingredients: ShoppingListIngredient[];
};

export function ShoppingListsList() {
  const { data: shoppingLists, isLoading, error, mutate } = useShoppingLists();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
      <div className="space-y-4">
        {shoppingLists.map((list) => (
        <div key={list.id}>
          {editingId === list.id ? (
            <div className="p-4 border rounded-lg space-y-2">
              <ShoppingListForm
                shoppingListId={list.id}
                initialName={list.name}
                initialIngredients={list.ingredients}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{list.name}</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(list.id)}
                    disabled={isPending}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(list.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {list.ingredients && list.ingredients.length > 0 ? (
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  {list.ingredients.map((ing) => (
                    <li key={ing.id}>
                      • {ing.quantity} {ing.unit} {ing.ingredient.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground ml-4">
                  No ingredients added yet.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
}
