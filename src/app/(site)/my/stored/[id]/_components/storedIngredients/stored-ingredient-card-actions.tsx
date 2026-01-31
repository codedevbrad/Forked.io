"use client";

import { Button } from "@/src/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type StoredIngredientCardActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isPending?: boolean;
};

export function StoredIngredientCardActions({
  onEdit,
  onDelete,
  isPending = false,
}: StoredIngredientCardActionsProps) {
  return (
    <>
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
    </>
  );
}
