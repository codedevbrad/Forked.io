"use client"

import { ChefHat } from "lucide-react"
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils"
import { ShoppingListIngredient } from "./types"

type IngredientItemProps = {
  ingredient: ShoppingListIngredient;
};

export function IngredientItem({ ingredient }: IngredientItemProps) {
  return (
    <li className="flex items-center gap-2 border rounded-md my-1 p-2 pl-4 shadow-md">
      <span className="text-sm text-gray-700">
       {ingredient.quantity} {ingredient.unit} {getIngredientDisplayName(ingredient.ingredient)}
      </span>
      {ingredient.recipe && (
        <span title={`From recipe: ${ingredient.recipe.name}`}>
          <ChefHat className="w-3 h-3" />
        </span>
      )}
    </li>
  );
}
