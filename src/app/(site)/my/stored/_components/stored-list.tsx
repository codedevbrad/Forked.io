"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { StoredForm } from "@/src/domains/stored/_components/stored-form";
import { deleteStoredAction } from "@/src/domains/stored/db";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { Trash2, Pencil, ExternalLink } from "lucide-react";
import { StorageType } from "@prisma/client";
import { ManageStoredIngredientsPopover } from "./manage-stored-ingredients-popover";

function getStorageTypeLabel(type: StorageType): string {
  switch (type) {
    case StorageType.pantry:
      return "Pantry";
    case StorageType.fridge:
      return "Fridge";
    case StorageType.freezer:
      return "Freezer";
    default:
      return type;
  }
}

export function StoredList() {
  const { data: stored, isLoading, error, mutate } = useStored();
  const [editingId, setEditingId] = useState<string | null>(null);
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
      const result = await deleteStoredAction(itemToDelete);
      if (result.success) {
        await mutate();
      } else {
        alert(result.error);
      }
      setItemToDelete(null);
    });
  };

  const handleEditSuccess = () => {
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">
        Loading storage locations...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading storage locations. Please try again.
      </p>
    );
  }

  if (!stored || stored.length === 0) {
    return (
      <p className="text-muted-foreground">
        No storage locations yet. Create your first storage location to get started.
      </p>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Storage Location"
        description="Are you sure you want to delete this storage location? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      <div className="space-y-4">
        {stored.map((location) => (
        <div key={location.id}>
          {editingId === location.id ? (
            <div className="p-4 border rounded-lg space-y-2">
              <StoredForm
                storedId={location.id}
                initialName={location.name}
                initialType={location.type}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Link href={`/my/stored/${location.id}`}>
                    <h3 className="font-semibold text-lg hover:underline cursor-pointer">
                      {location.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {getStorageTypeLabel(location.type)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ManageStoredIngredientsPopover
                    storedId={location.id}
                    storedName={location.name}
                    ingredients={location.ingredients || []}
                  />
                  <Link href={`/my/stored/${location.id}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      title="View details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(location.id)}
                    disabled={isPending}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(location.id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {location.ingredients && location.ingredients.length > 0 ? (
                <div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    {location.ingredients.slice(0, 3).map((si) => (
                      <li key={si.id}>
                        • {si.quantity} {si.unit} {si.ingredient.name}
                        {si.expiresAt && (
                          <span className="text-xs ml-2">
                            (expires: {new Date(si.expiresAt).toLocaleDateString()})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {location.ingredients.length > 3 && (
                    <Link href={`/my/stored/${location.id}`}>
                      <p className="text-sm text-muted-foreground ml-4 mt-2 hover:underline cursor-pointer">
                        + {location.ingredients.length - 3} more ingredient{location.ingredients.length - 3 !== 1 ? "s" : ""}
                      </p>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground ml-4">
                  No ingredients stored here yet.{" "}
                  <Link href={`/my/stored/${location.id}`} className="hover:underline">
                    Add ingredients
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
}
