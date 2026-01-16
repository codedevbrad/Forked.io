"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createStoredAction, updateStoredAction } from "@/src/domains/stored/db";
import { useStored } from "@/src/domains/stored/_contexts/useStored";
import { StorageType } from "@prisma/client";

type StoredFormProps = {
  storedId?: string;
  initialName?: string;
  initialType?: StorageType;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function StoredForm({ 
  storedId, 
  initialName = "", 
  initialType = StorageType.pantry,
  onSuccess,
  onCancel 
}: StoredFormProps) {
  const { mutate } = useStored();
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<StorageType>(initialType);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!storedId;

  useEffect(() => {
    setName(initialName);
    setType(initialType);
  }, [initialName, initialType, storedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Storage name is required");
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateStoredAction(storedId, name, type)
        : await createStoredAction(name, type);

      if (!result.success) {
        setError(result.error);
      } else {
        setName("");
        setType(StorageType.pantry);
        await mutate();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Storage Name 
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g., Main Pantry, Kitchen Fridge"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Storage Type
        </label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as StorageType)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={StorageType.pantry}>Pantry</SelectItem>
            <SelectItem value={StorageType.fridge}>Fridge</SelectItem>
            <SelectItem value={StorageType.freezer}>Freezer</SelectItem>
          </SelectContent>
        </Select>
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
            : (isEditing ? "Update Storage" : "Create Storage")
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
