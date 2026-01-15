"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { StoredForm } from "@/src/domains/stored/_components/stored-form";
import { Plus } from "lucide-react";

export function CreateStoredPopover() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Storage
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Create New Storage Location</h3>
            <p className="text-sm text-muted-foreground">
              Add a new storage location to organize your ingredients
            </p>
          </div>
          <StoredForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
