"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { IngredientsList } from "./ingredients-list";
import { CreateIngredientPopover } from "./create-ingredient-popover";
import { IngredientsFilter } from "./ingredients-filter";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useUser } from "@/src/domains/user/_contexts/useUser";

type Ingredient = {
  id: string;
  name: string;
  type: string;
  storageType: string | null;
  tag: Array<{ id: string; name: string; color: string }>;
  storeLinks?: Array<{ id: string; url: string }>;
};

export function IngredientsPageClient() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: ingredients = [], isLoading } = useIngredients();
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(ingredients);

  // Update filtered ingredients when ingredients change
  useEffect(() => {
    setFilteredIngredients(ingredients);
  }, [ingredients]);

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Ingredients</h1>
            <p className="text-muted-foreground">
              Manage your ingredients. Create, edit, and delete ingredients to use in recipes and storage.
            </p>
          </div>
          <CreateIngredientPopover />
        </div>

        {!isLoading && (
          <>
            {/* Filter Section */}
            <IngredientsFilter
              ingredients={ingredients}
              onFilterChange={setFilteredIngredients}
            />
          </>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Ingredients</h2>
          <IngredientsList filteredIngredients={filteredIngredients} />
        </div>
      </div>
    </div>
  );
}
