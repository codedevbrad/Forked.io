"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { RecipeForm } from "@/src/domains/recipes/_components/recipe-form";
import { deleteRecipeAction } from "@/src/domains/recipes/db";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { RecipeIngredientsPopover } from "./recipe-ingredients-popover";

export function RecipesList() {
  const { data: recipes, isLoading, error, mutate } = useRecipes();
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
      const result = await deleteRecipeAction(itemToDelete);
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
        Loading recipes...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading recipes. Please try again.
      </p>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-muted-foreground">
        No recipes yet. Create your first recipe to get started.
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="space-y-4">
        {recipes.map((recipe) => (
        <div key={recipe.id}>
          {editingId === recipe.id ? (
            <div className="p-4 border rounded-lg space-y-2">
              <RecipeForm
                recipeId={recipe.id}
                initialName={recipe.name}
                initialIngredients={recipe.ingredients}
                initialTags={recipe.tags || []}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
               
                <div className="font-semibold text-lg flex flex-row items-center gap-4">
                  <h3> {recipe.name}   </h3>  
                  {recipe.originalUrl && (
                  <Link href={recipe.originalUrl} target="_blank" className="text-sm text-muted-foreground underline"> 
                    View Original Recipe 
                  </Link>
                   )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(recipe.id)}
                    disabled={isPending}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(recipe.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
             
                <RecipeIngredientsPopover ingredients={recipe.ingredients} />
              </div>

            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
}
