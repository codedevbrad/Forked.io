"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShoppingListIngredient } from "./types";
import { IngredientItem } from "./ingredient-item";

type IngredientListProps = {
  ingredients: ShoppingListIngredient[];
  itemsPerPage?: number;
};

export function IngredientList({
  ingredients,
  itemsPerPage = 6,
}: IngredientListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when ingredients change
  useEffect(() => {
    setCurrentPage(1);
  }, [ingredients.length]);

  if (!ingredients || ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground ml-4">
        No ingredients added yet.
      </p>
    );
  }

  const totalPages = Math.ceil(ingredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = ingredients.slice(startIndex, endIndex);

  return (
    <div className="space-y-2">
      <ul className="text-sm text-muted-foreground space-y-1 ml-4 grid grid-cols-2 gap-2">
        {paginatedIngredients.map((ing) => (
            <IngredientItem key={ing.id} ingredient={ing} />
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-between ml-4 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}