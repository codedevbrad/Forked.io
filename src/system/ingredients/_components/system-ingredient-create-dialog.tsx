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
import { createSystemShopIngredientAction } from "../db";
import { getCategoriesAction } from "@/src/domains/categories/db";
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

type SystemIngredientCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function SystemIngredientCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: SystemIngredientCreateDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<IngredientType>("food");
  const [storageType, setStorageType] = useState<StorageType | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getCategoriesAction().then(setCategories);
      setName("");
      setType("food");
      setStorageType("");
      setCategoryId("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createSystemShopIngredientAction({
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="create-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="create-name"
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
              onValueChange={(v) =>
                setStorageType(v === "none" ? "" : (v as StorageType))
              }
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
            <Select
              value={categoryId || "none"}
              onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}
            >
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
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
