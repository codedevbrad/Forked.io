"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { IngredientForm } from "@/src/domains/ingredients/_components/ingredient-form";
import { Plus } from "lucide-react";

export function CreateIngredientPopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ingredient
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Create New Ingredient</h3>
            <p className="text-sm text-muted-foreground">
              Add a new ingredient to your collection
            </p>
          </div>
          <IngredientForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
