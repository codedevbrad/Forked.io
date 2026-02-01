"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { updateSystemShopIngredientAction } from "../db";
import { getCategoriesAction } from "@/src/domains/categories/db";
import type { SystemShopIngredientRow } from "../db";
import { IngredientType, StorageType } from "@prisma/client";

const INGREDIENT_TYPES: IngredientType[] = [
  "food",
  "drink",
  "condiment",
  "cleaning",
  "household",
];
const STORAGE_TYPES: StorageType[] = ["pantry", "fridge", "freezer"];

type Category = { id: string; name: string };

type SystemIngredientEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: SystemShopIngredientRow | null;
  onSuccess: () => void;
};

export function SystemIngredientEditDialog({
  open,
  onOpenChange,
  ingredient,
  onSuccess,
}: SystemIngredientEditDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<IngredientType>("food");
  const [storageType, setStorageType] = useState<StorageType | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getCategoriesAction().then(setCategories);
    }
  }, [open]);

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setType(ingredient.type as IngredientType);
      setStorageType(ingredient.storageType ?? "");
      setCategoryId(ingredient.categoryId ?? "");
    }
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient) return;
    startTransition(async () => {
      const result = await updateSystemShopIngredientAction(ingredient.id, {
        name: name.trim(),
        type,
        storageType: storageType || null,
        categoryId: categoryId || null,
      });
      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        alert(result.error);
      }
    });
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Type</span>
            <Select
              value={type}
              onValueChange={(v) => setType(v as IngredientType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INGREDIENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Storage</span>
            <Select
              value={storageType || "none"}
              onValueChange={(v) => setStorageType(v === "none" ? "" : (v as StorageType))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {STORAGE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
