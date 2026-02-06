"use client";

import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { List } from "lucide-react";
import { Unit } from "@prisma/client";

type RecipeIngredient = {
  id: string;
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: Unit;
};

type RecipeIngredientsPopoverProps = {
  ingredients: RecipeIngredient[];
};

export function RecipeIngredientsPopover({ ingredients }: RecipeIngredientsPopoverProps) {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground"
        >
          <List className="w-4 h-4 mr-1" />
          View Ingredients ({ingredients.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Ingredients</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {ingredients.map((ri) => (
              <li key={ri.id}>
                • {ri.quantity} {ri.unit} {getIngredientDisplayName(ri.ingredient)}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
