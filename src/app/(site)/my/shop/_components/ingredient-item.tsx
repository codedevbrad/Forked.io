"use client"

import { ChefHat } from "lucide-react"
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils"
import { ShoppingListIngredient } from "./types"

type IngredientItemProps = {
  ingredient: ShoppingListIngredient;
};

/** Resolve the display name from either the user Ingredient or the direct ShopIngredient. */
function getDisplayName(item: ShoppingListIngredient): string {
  // Direct ShopIngredient reference
  if (item.shopIngredient) {
    return item.shopIngredient.name;
  }
  // User-owned Ingredient (delegates to shopIngredient.name or customUserIngredient.name)
  if (item.ingredient) {
    return getIngredientDisplayName(item.ingredient);
  }
  return "Unnamed";
}

export function IngredientItem({ ingredient }: IngredientItemProps) {
  return (
    <li className="flex items-center gap-2 border rounded-md my-1 p-2 pl-4 shadow-md">
      <span className="text-sm text-gray-700">
       {ingredient.quantity} {ingredient.unit} {getDisplayName(ingredient)}
      </span>
      {ingredient.recipe && (
        <span title={`From recipe: ${ingredient.recipe.name}`}>
          <ChefHat className="w-3 h-3" />
        </span>
      )}
    </li>
  );
}
