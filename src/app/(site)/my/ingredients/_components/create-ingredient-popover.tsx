"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { IngredientForm } from "@/src/domains/ingredients/_components/ingredient-form";
import { Plus } from "lucide-react";

export function CreateIngredientPopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ingredient
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Create New Ingredient</DialogTitle>
          <DialogDescription>
            Add a new ingredient to your collection
          </DialogDescription>
        </DialogHeader>
        <IngredientForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
