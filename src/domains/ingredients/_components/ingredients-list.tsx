"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { IngredientCard } from "@/src/domains/ingredients/_components/ingredient";
import { ShoppingListsPopover } from "@/src/domains/ingredients/_components/shopping-lists-popover";
import { deleteIngredientAction } from "@/src/domains/ingredients/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { Trash2, ExternalLink, ShoppingCart, Package } from "lucide-react";
import { IngredientType, StorageType } from "@prisma/client";

/** Type/category from linked ShopIngredient (one-to-one) */
type Ingredient = {
  id: string;
  name: string;
  shopIngredient?: {
    type: IngredientType;
    storageType: StorageType | null;
    category: { id: string; name: string; color: string; icon?: string | null } | null;
  } | null;
  tag: Array<{ id: string; name: string; color: string }>;
  storeLinks?: Array<{ id: string; url: string }>;
};

type IngredientsListProps = {
  filteredIngredients?: Ingredient[];
};

export function IngredientsList({ filteredIngredients }: IngredientsListProps) {
  const { data: allIngredients, isLoading, error, mutate } = useIngredients();
  const { data: shoppingLists = [] } = useShoppingLists();
  const { data: storedItems = [] } = useStored();
  const ingredients = filteredIngredients || allIngredients || [];
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Create sets of ingredient IDs that are in shopping lists and stored
  const { ingredientsInShoppingLists, ingredientsStored } = useMemo(() => {
    const inShoppingLists = new Set<string>();
    const inStored = new Set<string>();

    // Extract ingredient IDs from shopping lists
    shoppingLists.forEach((list) => {
      list.ingredients?.forEach((ing) => {
        inShoppingLists.add(ing.ingredientId);
      });
    });

    // Extract ingredient IDs from stored items
    storedItems.forEach((storedItem) => {
      storedItem.ingredients?.forEach((storedIngredient) => {
        if (storedIngredient.ingredient?.id) {
          inStored.add(storedIngredient.ingredient.id);
        }
      });
    });

    return {
      ingredientsInShoppingLists: inShoppingLists,
      ingredientsStored: inStored,
    };
  }, [shoppingLists, storedItems]);

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
      <div className="mb-4 flex justify-end">
        <ShoppingListsPopover />
      </div>
      <div className="space-y-2 grid grid-cols-3 gap-4">
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="relative group">
            <IngredientCard
              ingredient={{
                ...ingredient,
                name:
                  (ingredient as { name?: string }).name ??
                  (ingredient.shopIngredient as { name?: string } | null)?.name ??
                  "",
              }}
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
            {/* Status indicators */}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              {ingredientsInShoppingLists.has(ingredient.id) && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                  title="In shopping list"
                >
                  <ShoppingCart className="w-3 h-3" />
                </div>
              )}
              {ingredientsStored.has(ingredient.id) && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  title="Stored"
                >
                  <Package className="w-3 h-3" />
                </div>
              )}
            </div>
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
