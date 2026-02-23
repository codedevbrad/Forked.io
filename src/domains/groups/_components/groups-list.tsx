"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { GroupModal } from "@/src/domains/groups/_components/group-modal";
import { deleteGroupAction } from "@/src/domains/groups/db";
import { useGroups } from "@/src/domains/groups/_contexts/useGroups";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { Trash2, Pencil, FolderOpen } from "lucide-react";

export function GroupsList() {
  const { data: groups, isLoading, error, mutate } = useGroups();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await deleteGroupAction(itemToDelete);
      if (result.success) {
        await mutate();
      } else {
        alert(result.error);
      }
      setItemToDelete(null);
    });
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">Loading groups...</p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading groups. Please try again.
      </p>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-1">
          No ingredient groups yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Create a group to organize your ingredients.
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Group"
        description="Are you sure you want to delete this group? The ingredients in the group will not be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="group relative rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-base leading-tight">
                {group.name}
              </h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <GroupModal
                  mode="edit"
                  group={group}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={isPending}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(group.id)}
                  disabled={isPending}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Ingredient count */}
            <p className="text-xs text-muted-foreground mb-2">
              {group.ingredients.length}{" "}
              {group.ingredients.length === 1 ? "ingredient" : "ingredients"}
            </p>

            {/* Ingredient chips */}
            {group.ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {group.ingredients.slice(0, 8).map((ing) => (
                  <span
                    key={ing.id}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                  >
                    {getIngredientDisplayName(ing)}
                  </span>
                ))}
                {group.ingredients.length > 8 && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    +{group.ingredients.length - 8} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No ingredients assigned
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
