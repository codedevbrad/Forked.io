"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { AddIngredientToStoredForm } from "./add-ingredient-to-stored-form";
import { Plus } from "lucide-react";

type AddIngredientToStoredPopoverProps = {
  storedId: string;
};

export function AddIngredientToStoredPopover({ storedId }: AddIngredientToStoredPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Add Ingredient to Storage</h3>
            <p className="text-sm text-muted-foreground">
              Add an ingredient to this storage location
            </p>
          </div>
          <AddIngredientToStoredForm storedId={storedId} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
