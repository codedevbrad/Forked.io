"use client";

import { ShoppingListForm } from "@/src/domains/shop/_components/shopping-list-form";
import { ShoppingList } from "./types";
import { ShoppingListHeader } from "./shopping-list-header";
import { RecipeTags } from "./recipe-tags";
import { RecipeFilter } from "./recipe-filter";
import { IngredientList } from "./ingredient-list";

type ShoppingListItemProps = {
  list: ShoppingList;
  isEditing: boolean;
  selectedRecipeFilter: string;
  onEdit: () => void;
  onDelete: () => void;
  onEditSuccess: () => void;
  onEditCancel: () => void;
  onRecipeFilterChange: (recipeId: string) => void;
  isPending: boolean;
};

export function ShoppingListItem({
  list,
  isEditing,
  selectedRecipeFilter,
  onEdit,
  onDelete,
  onEditSuccess,
  onEditCancel,
  onRecipeFilterChange,
  isPending,
}: ShoppingListItemProps) {
  const getFilteredIngredients = (): ShoppingList["ingredients"] => {
    if (!selectedRecipeFilter || selectedRecipeFilter === "all") {
      return list.ingredients;
    }
    return list.ingredients.filter(
      (ing) => ing.recipe?.id === selectedRecipeFilter
    );
  };

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg space-y-2">
        <ShoppingListForm
          shoppingListId={list.id}
          initialName={list.name}
          initialIngredients={list.ingredients}
          initialRecipes={
            list.recipes?.map((r) => ({
              id: r.recipe.id,
              name: r.recipe.name,
            })) || []
          }
          onSuccess={onEditSuccess}
          onCancel={onEditCancel}
        />
      </div>
    );
  }

  const filteredIngredients = getFilteredIngredients();

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <ShoppingListHeader
        name={list.name}
        onEdit={onEdit}
        onDelete={onDelete}
        isPending={isPending}
      />
      <RecipeTags recipes={list.recipes || []} />
      {list.ingredients && list.ingredients.length > 0 && (
        <RecipeFilter
          recipes={list.recipes}
          selectedRecipeId={selectedRecipeFilter}
          onRecipeChange={onRecipeFilterChange}
        />
      )}
      {filteredIngredients && filteredIngredients.length > 0 ? (
        <IngredientList ingredients={filteredIngredients} />
      ) : list.ingredients && list.ingredients.length > 0 ? (
        <p className="text-sm text-muted-foreground ml-4">
          No ingredients match the selected filter.
        </p>
      ) : null}
    </div>
  );
}
