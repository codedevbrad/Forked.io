"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { IngredientForm } from "@/src/domains/ingredients/_components/ingredient-form";
import { deleteIngredientAction } from "@/src/domains/ingredients/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { Trash2, Pencil, ExternalLink } from "lucide-react";

type Ingredient = {
  id: string;
  name: string;
  type: string;
  storageType: string | null;
  tag: Array<{ id: string; name: string; color: string }>;
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
        <div key={ingredient.id}>
          {editingId === ingredient.id ? (
            <div className="p-4 border rounded-lg space-y-2">
              <IngredientForm
                ingredientId={ingredient.id}
                initialName={ingredient.name}
                initialType={ingredient.type as any}
                initialStorageType={ingredient.storageType as any}
                initialTagIds={ingredient.tag.map(t => t.id)}
                initialStoreLinks={ingredient.storeLinks?.map(sl => sl.url) || []}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ingredient.name}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(ingredient.id)}
                    disabled={isPending}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(ingredient.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {ingredient.tag && ingredient.tag.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ingredient.tag.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              {ingredient.storeLinks && ingredient.storeLinks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
          )}
        </div>
      ))}
      </div>
    </>
  );
}
