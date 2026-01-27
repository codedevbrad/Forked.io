"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { RecipeWebsiteForm } from "./recipe-website-form";
import { useRecipeWebsites } from "../_contexts/useRecipeWebsites";
import { deleteRecipeWebsiteAction } from "../db";
import { RecipeWebsites } from "@prisma/client";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export function RecipeWebsiteManagement() {
  const { data: websites, isLoading, mutate } = useRecipeWebsites();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<RecipeWebsites | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<RecipeWebsites | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (website: RecipeWebsites) => {
    setEditingWebsite(website);
  };

  const handleCloseEdit = () => {
    setEditingWebsite(null);
  };

  const handleDelete = (website: RecipeWebsites) => {
    setDeletingWebsite(website);
  };

  const handleConfirmDelete = () => {
    if (!deletingWebsite) return;

    startTransition(async () => {
      const result = await deleteRecipeWebsiteAction(deletingWebsite.id);
      if (result.success) {
        await mutate();
        setDeletingWebsite(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recipe Websites</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Recipe Website</DialogTitle>
              <DialogDescription>
                Add a new recipe website to discover recipes from
              </DialogDescription>
            </DialogHeader>
            <RecipeWebsiteForm
              onSuccess={() => setCreateOpen(false)}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading websites...</div>
      ) : websites && websites.length > 0 ? (
        <div className="space-y-2">
          {websites.map((website) => (
            <div
              key={website.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{website.name}</h3>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  {website.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(website)}
                  disabled={isPending}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(website)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-8 border rounded-lg">
          No websites found. Add your first recipe website to get started.
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingWebsite} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipe Website</DialogTitle>
            <DialogDescription>
              Update the website information
            </DialogDescription>
          </DialogHeader>
          {editingWebsite && (
            <RecipeWebsiteForm
              websiteId={editingWebsite.id}
              initialName={editingWebsite.name}
              initialUrl={editingWebsite.url}
              onSuccess={handleCloseEdit}
              onCancel={handleCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingWebsite}
        onOpenChange={(open) => !open && setDeletingWebsite(null)}
        title="Delete Recipe Website"
        description={`Are you sure you want to delete "${deletingWebsite?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
