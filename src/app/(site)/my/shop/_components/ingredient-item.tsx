"use client";

import { ChefHat } from "lucide-react";
import { ShoppingListIngredient } from "./types";

type IngredientItemProps = {
  ingredient: ShoppingListIngredient;
};

export function IngredientItem({ ingredient }: IngredientItemProps) {
  return (
    <li className="flex items-center gap-2">
      <span>
        • {ingredient.quantity} {ingredient.unit} {ingredient.ingredient.name}
      </span>
      {ingredient.recipe && (
        <span title={`From recipe: ${ingredient.recipe.name}`}>
          <ChefHat className="w-3 h-3 text-muted-foreground" />
        </span>
      )}
    </li>
  );
}
