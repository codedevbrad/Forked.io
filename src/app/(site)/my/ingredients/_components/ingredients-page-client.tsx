"use client";

import { useState, useEffect } from "react"; 
import { IngredientsList } from "../../../../../domains/ingredients/_components/ingredients-list";
import { CreateIngredientPopover } from "./create-ingredient-popover";
import { IngredientsFilter } from "./ingredients-filter";
import { IngredientsStatusFilter } from "./ingredients-status-filter";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IngredientType, StorageType } from "@prisma/client";

type Ingredient = {
  id: string;
  name: string;
  type: IngredientType;
  storageType: StorageType | null;
  tag: Array<{ id: string; name: string; color: string }>;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  storeLinks?: Array<{ id: string; url: string }>;
};

const ITEMS_PER_PAGE = 10;

export function IngredientsPageClient() {
  const { data: ingredients = [], isLoading } = useIngredients();
  const [filteredByMainFilter, setFilteredByMainFilter] = useState<Ingredient[]>(ingredients);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(ingredients);
  const [currentPage, setCurrentPage] = useState(1);

  // Update filtered ingredients when ingredients change
  useEffect(() => {
    setFilteredByMainFilter(ingredients);
    setFilteredIngredients(ingredients);
  }, [ingredients]);

  // Reset to page 1 when filtered ingredients change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredIngredients.length]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIngredients = filteredIngredients.slice(startIndex, endIndex);

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
              onFilterChange={setFilteredByMainFilter}
            />
            
            {/* Status Filter Pills */}
            <IngredientsStatusFilter
              ingredients={filteredByMainFilter}
              onFilterChange={setFilteredIngredients}
            />
          </>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Ingredients</h2>
            {filteredIngredients.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredIngredients.length)} of {filteredIngredients.length}
              </p>
            )}
          </div>
          <IngredientsList filteredIngredients={paginatedIngredients} />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
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
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
