"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { IngredientForm } from "@/src/domains/ingredients/_components/ingredient-form";
import { IngredientCard } from "@/src/domains/ingredients/_components/ingredient";
import { deleteIngredientAction } from "@/src/domains/ingredients/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { Trash2, Pencil, ExternalLink } from "lucide-react";
import { IngredientType, StorageType } from "@prisma/client";

type Ingredient = {
  id: string;
  name: string;
  type: IngredientType;
  storageType: StorageType | null;
  tag: Array<{ id: string; name: string; color: string }>;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  storeLinks?: Array<{ id: string; url: string }>;
};

type IngredientsListProps = {
  filteredIngredients?: Ingredient[];
};

export function IngredientsList({ filteredIngredients }: IngredientsListProps) {
  const { data: allIngredients, isLoading, error, mutate } = useIngredients();
  const ingredients = filteredIngredients || allIngredients || [];
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
      const result = await deleteIngredientAction(itemToDelete);
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

  if (!isLoading && (!allIngredients || allIngredients.length === 0)) {
    return (
      <p className="text-muted-foreground">
        No ingredients yet. Create your first ingredient to get started.
      </p>
    );
  }

  if (!isLoading && ingredients.length === 0 && filteredIngredients) {
    return (
      <p className="text-muted-foreground">
        No ingredients match your filters. Try adjusting your search criteria.
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Ingredient"
        description="Are you sure you want to delete this ingredient? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="space-y-2 grid grid-cols-3 gap-4">
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="relative group">
            <IngredientCard
              ingredient={ingredient}
              isEditing={editingId === ingredient.id}
              editComponent={
                editingId === ingredient.id ? (
                  <IngredientForm
                    ingredientId={ingredient.id}
                    initialName={ingredient.name}
                    initialType={ingredient.type}
                    initialStorageType={ingredient.storageType}
                    initialCategoryId={ingredient.category?.id || null}
                    initialTagIds={ingredient.tag.map(t => t.id)}
                    initialStoreLinks={ingredient.storeLinks?.map(sl => sl.url) || []}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setEditingId(null)}
                  />
                ) : undefined
              }
            />
            {editingId !== ingredient.id && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(ingredient.id)}
                  disabled={isPending}
                  className="h-7 w-7 p-0"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(ingredient.id)}
                  disabled={isPending}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {ingredient.storeLinks && ingredient.storeLinks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ingredient.storeLinks.map((storeLink) => (
                  <a
                    key={storeLink.id}
                    href={storeLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Store Link
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
