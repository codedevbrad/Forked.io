"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { RecipeForm } from "@/src/domains/recipes/_components/recipe-form";
import { Plus } from "lucide-react";

export function CreateRecipePopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Recipe
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="start">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Create New Recipe</h3>
            <p className="text-sm text-muted-foreground">
              Add a new recipe with ingredients and quantities
            </p>
          </div>
          <RecipeForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
