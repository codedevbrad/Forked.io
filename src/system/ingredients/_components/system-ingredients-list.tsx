"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useSystemIngredients } from "../_contexts/useSystemIngredients";
import { SystemIngredientEditDialog } from "./system-ingredient-edit-dialog";
import { SystemIngredientCreateDialog } from "./system-ingredient-create-dialog";
import type { SystemShopIngredientRow } from "../db";
import { Pencil, Plus } from "lucide-react";

export function SystemIngredientsList() {
  const { data: ingredients, isLoading, error, mutate } = useSystemIngredients();
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SystemShopIngredientRow | null>(null);

  const handleEditClick = (row: SystemShopIngredientRow) => {
    setEditing(row);
    setEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditing(null);
  };

  const handleEditSuccess = () => {
    void mutate();
  };

  const handleCreateSuccess = () => {
    void mutate();
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">Loading ingredients…</p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading ingredients. Please try again.
      </p>
    );
  }

  return (
    <>
      <SystemIngredientEditDialog
        open={editOpen}
        onOpenChange={handleEditOpenChange}
        ingredient={editing}
        onSuccess={handleEditSuccess}
      />
      <SystemIngredientCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCreateSuccess}
      />
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add ingredient
        </Button>
      </div>
      {!ingredients || ingredients.length === 0 ? (
        <p className="text-muted-foreground">No ingredients yet.</p>
      ) : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((row) => (
          <div
            key={row.id}
            className="group relative flex flex-col gap-1 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{row.name}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleEditClick(row)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0 text-sm text-muted-foreground">
              <span>{row.type}</span>
              {row.storageType != null && (
                <span>{row.storageType}</span>
              )}
              {row.categoryName != null && (
                <span>{row.categoryName}</span>
              )}
            </div>
            <div className="mt-1 text-sm">
              <span className="text-muted-foreground">Users using: </span>
              <span className="font-medium">{row.userCount}</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </>
  );
}
