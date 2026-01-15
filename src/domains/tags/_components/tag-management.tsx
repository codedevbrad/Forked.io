"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { useTags } from "../_contexts/useTags";
import { createTagAction, updateTagAction, deleteTagAction } from "../db";
import { Tag as TagIcon, Edit2, Trash2, Plus } from "lucide-react";

type TagType = {
  id: string;
  name: string;
  color: string;
};

export function TagManagement() {
  const { data: tags, mutate } = useTags();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagType | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleOpenCreate = () => {
    setName("");
    setColor("#3b82f6");
    setError("");
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (tag: TagType) => {
    setName(tag.name);
    setColor(tag.color);
    setError("");
    setEditingTag(tag);
  };

  const handleCloseCreate = () => {
    setIsCreateDialogOpen(false);
    setName("");
    setColor("#3b82f6");
    setError("");
  };

  const handleCloseEdit = () => {
    setEditingTag(null);
    setName("");
    setColor("#3b82f6");
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }

    startTransition(async () => {
      const result = await createTagAction(name, color);
      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        handleCloseCreate();
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }

    if (!editingTag) return;

    startTransition(async () => {
      const result = await updateTagAction(editingTag.id, name, color);
      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        handleCloseEdit();
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingTag) return;

    startTransition(async () => {
      const result = await deleteTagAction(deletingTag.id);
      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        setDeletingTag(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tags</h2>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {tags && tags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tags yet. Create your first tag to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags?.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm font-medium truncate">{tag.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleOpenEdit(tag)}
                  className="h-7 w-7"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeletingTag(tag)}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to organize your ingredients.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="create-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tag name"
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="create-color" className="text-sm font-medium">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                    disabled={isPending}
                  />
                  <Input
                    id="create-color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    disabled={isPending}
                    className="flex-1"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreate}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name and color.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tag name"
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-color" className="text-sm font-medium">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                    disabled={isPending}
                  />
                  <Input
                    id="edit-color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    disabled={isPending}
                    className="flex-1"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEdit}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
        title="Delete Tag"
        description={`Are you sure you want to delete "${deletingTag?.name}"? This will remove the tag from all associated ingredients.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
