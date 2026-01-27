"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { RecipeForm } from "@/src/domains/recipes/_components/recipe-form";
import { deleteRecipeAction } from "@/src/domains/recipes/db";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { Trash2, Pencil, X, List, Grid3x3, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RecipeIngredientsPopover } from "./recipe-ingredients-popover";
import { useLocalStorage } from "@/src/hooks/use-local-storage";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type ViewMode = "single" | "small-grid" | "large-grid";

export function RecipesList() {
  const { data: recipes, isLoading, error, mutate } = useRecipes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("recipes-view-mode", "single");

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
        {/* View Mode Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              View:
            </h3>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "single" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("single")}
                className="h-7 px-2"
                title="Single column"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "small-grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("small-grid")}
                className="h-7 px-2"
                title="Small grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "large-grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("large-grid")}
                className="h-7 px-2"
                title="Large grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

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
          <div
            className={
              viewMode === "single"
                ? "space-y-4"
                : viewMode === "small-grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "grid grid-cols-1 lg:grid-cols-2 gap-6"
            }
          >
            {filteredRecipes.map((recipe) => (
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
                  <div
                    className={`border rounded-lg space-y-3 ${
                      viewMode === "single"
                        ? "p-4"
                        : viewMode === "small-grid"
                        ? "p-3"
                        : "p-4"
                    }`}
                  >
                    {/* Recipe Image */}
                    {recipe.image && (
                      <div
                        className={`relative w-full rounded-lg overflow-hidden border bg-muted ${
                          viewMode === "single"
                            ? "h-64"
                            : viewMode === "small-grid"
                            ? "h-40"
                            : "h-80"
                        }`}
                      >
                        <Image
                          src={recipe.image}
                          alt={recipe.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            // Hide broken images and show placeholder
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-muted-foreground"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                            }
                          }}
                        />
                      </div>
                    )}

                    <div
                      className={`flex items-start justify-between gap-4 ${
                        viewMode === "small-grid" ? "flex-col" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold flex flex-row items-center gap-4 ${
                            viewMode === "single"
                              ? "text-lg"
                              : viewMode === "small-grid"
                              ? "text-sm flex-wrap"
                              : "text-lg"
                          }`}
                        >
                          <h3
                            className={
                              viewMode === "small-grid"
                                ? "break-words"
                                : "truncate"
                            }
                          >
                            {recipe.name}
                          </h3>
                          {recipe.originalUrl && viewMode !== "small-grid" && (
                            <Link
                              href={recipe.originalUrl}
                              target="_blank"
                              className="text-sm text-muted-foreground underline shrink-0"
                            >
                              View Original Recipe
                            </Link>
                          )}
                        </div>
                        {recipe.originalUrl && viewMode === "small-grid" && (
                          <Link
                            href={recipe.originalUrl}
                            target="_blank"
                            className="text-xs text-muted-foreground underline mt-1 block"
                          >
                            View Original Recipe
                          </Link>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
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
            ))}
          </div>
        )}
      </div>
    </>
  );
}
