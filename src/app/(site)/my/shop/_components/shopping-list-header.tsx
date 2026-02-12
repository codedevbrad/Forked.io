"use client";

import { Button } from "@/src/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type ShoppingListHeaderProps = {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
};

export function ShoppingListHeader({
  name,
  onEdit,
  onDelete,
  isPending,
}: ShoppingListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg">{name}</h3>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          disabled={isPending}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
