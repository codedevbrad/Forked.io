"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { useShoppingLists } from "@/src/domains/shop/_contexts/useShoppingLists";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { useRecipes } from "@/src/domains/recipes/_contexts/useRecipes";
import { Package, ShoppingCart, ChefHat } from "lucide-react";
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

type IngredientsStatusFilterProps = {
  ingredients: Ingredient[];
  onFilterChange: (filtered: Ingredient[]) => void;
};

type FilterStatus = "stored" | "inShoppingLists" | "inRecipes" | null;

export function IngredientsStatusFilter({ ingredients, onFilterChange }: IngredientsStatusFilterProps) {
  const { data: shoppingLists = [] } = useShoppingLists();
  const { data: storedItems = [] } = useStored();
  const { data: recipes = [] } = useRecipes();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>(null);

  // Create sets of ingredient IDs
  const { ingredientsInShoppingLists, ingredientsStored, ingredientsInRecipes } = useMemo(() => {
    const inShoppingLists = new Set<string>();
    const inStored = new Set<string>();
    const inRecipes = new Set<string>();

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

    // Extract ingredient IDs from recipes
    recipes.forEach((recipe) => {
      recipe.ingredients?.forEach((recipeIngredient) => {
        if (recipeIngredient.ingredient?.id) {
          inRecipes.add(recipeIngredient.ingredient.id);
        }
      });
    });

    return {
      ingredientsInShoppingLists: inShoppingLists,
      ingredientsStored: inStored,
      ingredientsInRecipes: inRecipes,
    };
  }, [shoppingLists, storedItems, recipes]);

  // Filter ingredients based on active filter
  const filteredIngredients = useMemo(() => {
    if (!activeFilter) {
      return ingredients;
    }

    return ingredients.filter((ingredient) => {
      switch (activeFilter) {
        case "stored":
          return ingredientsStored.has(ingredient.id);
        case "inShoppingLists":
          return ingredientsInShoppingLists.has(ingredient.id);
        case "inRecipes":
          return ingredientsInRecipes.has(ingredient.id);
        default:
          return true;
      }
    });
  }, [ingredients, activeFilter, ingredientsStored, ingredientsInShoppingLists, ingredientsInRecipes]);

  // Update parent when filtered results change
  useEffect(() => {
    onFilterChange(filteredIngredients);
  }, [filteredIngredients, onFilterChange]);

  const handleFilterToggle = (filter: FilterStatus) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const storedCount = ingredients.filter((ing) => ingredientsStored.has(ing.id)).length;
  const shoppingListsCount = ingredients.filter((ing) => ingredientsInShoppingLists.has(ing.id)).length;
  const recipesCount = ingredients.filter((ing) => ingredientsInRecipes.has(ing.id)).length;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={activeFilter === "stored" ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilterToggle("stored")}
        className="gap-2"
      >
        <Package className="w-4 h-4" />
        Stored
        {storedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
            {storedCount}
          </span>
        )}
      </Button>
      <Button
        type="button"
        variant={activeFilter === "inShoppingLists" ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilterToggle("inShoppingLists")}
        className="gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        In Shopping Lists
        {shoppingListsCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
            {shoppingListsCount}
          </span>
        )}
      </Button>
      <Button
        type="button"
        variant={activeFilter === "inRecipes" ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilterToggle("inRecipes")}
        className="gap-2"
      >
        <ChefHat className="w-4 h-4" />
        In Recipes
        {recipesCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
            {recipesCount}
          </span>
        )}
      </Button>
    </div>
  );
}
