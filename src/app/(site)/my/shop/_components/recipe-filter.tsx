"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

type RecipeFilterProps = {
  recipes?: Array<{
    id: string;
    recipe: {
      id: string;
      name: string;
    };
  }>;
  selectedRecipeId: string;
  onRecipeChange: (recipeId: string) => void;
};

export function RecipeFilter({
  recipes,
  selectedRecipeId,
  onRecipeChange,
}: RecipeFilterProps) {
  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 ml-4">
        <label className="text-xs font-medium text-muted-foreground">
          Filter by recipe:
        </label>
        <Select value={selectedRecipeId} onValueChange={onRecipeChange}>
          <SelectTrigger className="h-7 w-[180px]">
            <SelectValue placeholder="All ingredients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ingredients</SelectItem>
            {recipes.map((r) => (
              <SelectItem key={r.recipe.id} value={r.recipe.id}>
                {r.recipe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
