"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { ShoppingListForm } from "@/src/domains/shop/_components/shopping-list-form";
import { Plus } from "lucide-react";

export function CreateShoppingListPopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Shopping List
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96 max-w-[calc(100%-2rem)] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
          <DialogDescription>
            Add a new shopping list with ingredients and quantities
          </DialogDescription>
        </DialogHeader>
        <ShoppingListForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
