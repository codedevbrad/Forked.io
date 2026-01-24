"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { RecipeForm } from "@/src/domains/recipes/_components/recipe-form";
import { deleteRecipeAction } from "@/src/domains/recipes/db";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { Trash2, Pencil, X } from "lucide-react";
import Link from "next/link";
import { RecipeIngredientsPopover } from "./recipe-ingredients-popover";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function RecipesList() {
  const { data: recipes, isLoading, error, mutate } = useRecipes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

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

  // Extract all unique tags from recipes
  const allTags = useMemo(() => {
    if (!recipes) return [];
    const tagMap = new Map<string, Tag>();
    recipes.forEach((recipe) => {
      recipe.tags?.forEach((tag) => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  // Filter recipes based on selected tag
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    if (!selectedTagId) return recipes;
    return recipes.filter((recipe) =>
      recipe.tags?.some((tag) => tag.id === selectedTagId)
    );
  }, [recipes, selectedTagId]);

  const handleTagClick = (tagId: string) => {
    setSelectedTagId(selectedTagId === tagId ? null : tagId);
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
        {/* Tag Filter Section */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Filter by Tag
              </h3>
              {selectedTagId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTagId(null)}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear filter
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTagId === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-colors border
                      ${isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                      }
                    `}
                    style={
                      isSelected
                        ? { borderColor: tag.color, backgroundColor: tag.color, color: "white" }
                        : {}
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recipes List */}
        {filteredRecipes.length === 0 ? (
          <p className="text-muted-foreground">
            {selectedTagId
              ? "No recipes found with the selected tag."
              : "No recipes yet. Create your first recipe to get started."}
          </p>
        ) : (
          filteredRecipes.map((recipe) => (
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

              <div className="flex items-center gap-2 flex-wrap">
                <RecipeIngredientsPopover ingredients={recipe.ingredients} />
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
          ))
        )}
      </div>
    </>
  );
}
