"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { useTags } from "@/src/domains/tags/_contexts/useTags";
import { createTagAction } from "@/src/domains/tags/db";
import { Check, Plus, Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

type TagSelectorProps = {
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  disabled?: boolean;
};

export function TagSelector({
  selectedTagIds,
  onSelectionChange,
  disabled = false,
}: TagSelectorProps) {
  const { data: tags, mutate: mutateTags } = useTags();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [isPending, startTransition] = useTransition();
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onSelectionChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTagName.trim()) return;

    startTransition(async () => {
      const result = await createTagAction(newTagName.trim(), newTagColor);
      if (result.success) {
        setNewTagName("");
        setNewTagColor("#3b82f6");
        setIsCreatingTag(false);
        // Keep popover open after creating tag
        setOpen(true);
        await mutateTags();
        // Auto-select the newly created tag
        onSelectionChange([...selectedTagIds, result.data.id]);
      }
    });
  };

  const selectedTags = tags?.filter(tag => selectedTagIds.includes(tag.id)) || [];
  const availableTags = tags || [];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <TagIcon className="w-3 h-3" />
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                disabled={disabled}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No tags selected</span>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            <Plus className="w-4 h-4 mr-2" />
            {selectedTags.length > 0 ? "Manage Tags" : "Add Tags"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Select Tags</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available. Create one below.</p>
                ) : (
                  availableTags.map((tag) => (
                    <label
                      key={tag.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                        selectedTagIds.includes(tag.id) && "bg-accent"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center"
                        style={{
                          borderColor: selectedTagIds.includes(tag.id) ? tag.color : "currentColor",
                          backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : "transparent",
                        }}
                      >
                        {selectedTagIds.includes(tag.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm flex-1">{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              {!isCreatingTag ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsCreatingTag(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Tag
                </Button>
              ) : (
                <form onSubmit={handleCreateTag} onClick={(e) => e.stopPropagation()} className="space-y-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    disabled={isPending}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-10 h-10 rounded border"
                      disabled={isPending}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Input
                      type="text"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                      disabled={isPending}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending || !newTagName.trim()}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPending ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreatingTag(false);
                        setNewTagName("");
                        setNewTagColor("#3b82f6");
                      }}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
