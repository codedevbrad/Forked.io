"use client";

import { SystemIngredientsList } from "@/src/system/ingredients/_components/system-ingredients-list";

export default function IngredientsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ingredients</h1>
      <p className="text-muted-foreground text-sm">
        System ShopIngredients and how many users are using each (via linked
        Ingredient).
      </p>
      <SystemIngredientsList />
    </div>
  );
}
