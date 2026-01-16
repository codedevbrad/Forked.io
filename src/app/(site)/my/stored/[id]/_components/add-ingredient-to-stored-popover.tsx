"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Add Ingredient to Storage</DialogTitle>
          <DialogDescription>
            Add an ingredient to this storage location
          </DialogDescription>
        </DialogHeader>
        <AddIngredientToStoredForm storedId={storedId} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
