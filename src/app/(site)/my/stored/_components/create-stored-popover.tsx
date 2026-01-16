"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { StoredForm } from "@/src/domains/stored/_components/stored-form";
import { Plus } from "lucide-react";

export function CreateStoredPopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Storage
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Create New Storage Location</DialogTitle>
          <DialogDescription>
            Add a new storage location to organize your ingredients
          </DialogDescription>
        </DialogHeader>
        <StoredForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
