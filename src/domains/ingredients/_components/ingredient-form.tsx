"use client";

import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createIngredientAction, updateIngredientAction } from "@/src/domains/ingredients/db";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { TagSelector } from "./tag-selector";
import { IngredientType, StorageType } from "@prisma/client";
import { Plus, X, ExternalLink } from "lucide-react";

type IngredientFormProps = {
  ingredientId?: string;
  initialName?: string;
  initialType?: IngredientType;
  initialStorageType?: StorageType | null;
  initialTagIds?: string[];
  initialStoreLinks?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function IngredientForm({ 
  ingredientId, 
  initialName = "", 
  initialType = IngredientType.food,
  initialStorageType = null,
  initialTagIds = [],
  initialStoreLinks = [],
  onSuccess,
  onCancel 
}: IngredientFormProps) {
  const { mutate } = useIngredients();
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<IngredientType>(initialType);
  const [storageType, setStorageType] = useState<StorageType | null>(initialStorageType);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [storeLinks, setStoreLinks] = useState<string[]>(initialStoreLinks);
  const [newStoreLink, setNewStoreLink] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!ingredientId;

  // Convert storageType to string for Select component - memoized to prevent re-renders
  const storageTypeValue = useMemo(() => storageType ?? "__none__", [storageType]);

  // Track the last ingredientId we initialized for to prevent re-initialization loops
  const lastInitializedId = useRef<string | undefined>(undefined);

  // Only update when ingredientId changes (switching between edit/create mode)
  useEffect(() => {
    if (ingredientId !== lastInitializedId.current) {
      lastInitializedId.current = ingredientId;
      if (ingredientId) {
        // We're editing - sync with initial values
        setName(initialName);
        setType(initialType);
        setStorageType(initialStorageType ?? null);
        setSelectedTagIds(initialTagIds);
        setStoreLinks(initialStoreLinks);
      } else {
        // We're creating - reset to defaults
        setName("");
        setType(IngredientType.food);
        setStorageType(null);
        setSelectedTagIds([]);
        setStoreLinks([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingredient name is required");
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateIngredientAction(
            ingredientId, 
            name, 
            type, 
            storageType, 
            selectedTagIds.length > 0 ? selectedTagIds : undefined,
            storeLinks.length > 0 ? storeLinks : undefined
          )
        : await createIngredientAction(
            name, 
            type, 
            storageType || undefined, 
            selectedTagIds.length > 0 ? selectedTagIds : undefined,
            storeLinks.length > 0 ? storeLinks : undefined
          );

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setType(IngredientType.food);
        setStorageType(null);
        setSelectedTagIds([]);
        setStoreLinks([]);
        setNewStoreLink("");
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Ingredient Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., Flour, Sugar, Salt"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Type <span className="text-destructive">*</span>
        </label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as IngredientType)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={IngredientType.food}>Food</SelectItem>
            <SelectItem value={IngredientType.drink}>Drink</SelectItem>
            <SelectItem value={IngredientType.condiment}>Condiment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="storageType" className="text-sm font-medium">
          Storage Type
        </label>
        <Select
          key={`storage-${ingredientId || 'new'}`}
          value={storageTypeValue}
          onValueChange={(value) => {
            const newValue = value === "__none__" ? null : (value as StorageType);
            setStorageType(newValue);
          }}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select storage type (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            <SelectItem value={StorageType.pantry}>Pantry</SelectItem>
            <SelectItem value={StorageType.fridge}>Fridge</SelectItem>
            <SelectItem value={StorageType.freezer}>Freezer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TagSelector
        selectedTagIds={selectedTagIds}
        onSelectionChange={setSelectedTagIds}
        disabled={isPending}
      />

      <div className="space-y-2">
        <label htmlFor="storeLinks" className="text-sm font-medium">
          Store Links
        </label>
        <div className="space-y-2">
          {storeLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link}
                onChange={(e) => {
                  const updated = [...storeLinks];
                  updated[index] = e.target.value;
                  setStoreLinks(updated);
                }}
                placeholder="https://..."
                disabled={isPending}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = storeLinks.filter((_, i) => i !== index);
                  setStoreLinks(updated);
                }}
                disabled={isPending}
              >
                <X className="w-4 h-4" />
              </Button>
              {link && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(link, '_blank')}
                  disabled={isPending}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newStoreLink}
              onChange={(e) => setNewStoreLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newStoreLink.trim()) {
                  e.preventDefault();
                  setStoreLinks([...storeLinks, newStoreLink.trim()]);
                  setNewStoreLink("");
                }
              }}
              placeholder="Add store link (e.g., https://example.com)"
              disabled={isPending}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (newStoreLink.trim()) {
                  setStoreLinks([...storeLinks, newStoreLink.trim()]);
                  setNewStoreLink("");
                }
              }}
              disabled={isPending || !newStoreLink.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Ingredient" : "Create Ingredient")
          }
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
