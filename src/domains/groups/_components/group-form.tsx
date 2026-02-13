"use client";

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createGroupAction, updateGroupAction } from "@/src/domains/groups/db";
import { useGroups } from "@/src/domains/groups/_contexts/useGroups";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { ensureIngredientForShopAction } from "@/src/domains/ingredients/db";
import {
  IngredientPicker,
  PickedIngredient,
  IngredientSource,
  compositeKey,
} from "@/src/domains/ingredients/_components/ingredient-picker";
import { ChevronDown, X } from "lucide-react";

/**
 * Each selected item tracks both the picker's composite key
 * (source + originalId) and the resolved Ingredient.id that the group
 * model actually stores.
 */
type SelectedItem = {
  source: IngredientSource;
  originalId: string; // picker id: Ingredient.id for "user", ShopIngredient.id for "shop"
  ingredientId: string; // resolved Ingredient.id for the group relation
  name: string;
};

type InitialIngredient = {
  id: string; // Ingredient.id
  name: string;
  shopIngredientId?: string | null;
};

type GroupFormProps = {
  groupId?: string;
  initialName?: string;
  /** Pre-selected ingredients for edit mode. */
  initialIngredients?: InitialIngredient[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

/** Convert edit-mode initial ingredients to SelectedItem[] */
function resolveInitialIngredients(items: InitialIngredient[]): SelectedItem[] {
  return items.map((ing) => ({
    // If it has a shopIngredientId, it was a shop-catalog pick originally
    source: ing.shopIngredientId ? ("shop" as const) : ("user" as const),
    originalId: ing.shopIngredientId ?? ing.id,
    ingredientId: ing.id,
    name: ing.name,
  }));
}

export function GroupForm({
  groupId,
  initialName = "",
  initialIngredients = [],
  onSuccess,
  onCancel,
}: GroupFormProps) {
  const { mutate } = useGroups();
  const { mutate: mutateIngredients } = useIngredients();
  const [name, setName] = useState(initialName);
  const [ingredients, setIngredients] = useState<SelectedItem[]>(() =>
    resolveInitialIngredients(initialIngredients)
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!groupId;

  // Build shopIngredientId → Ingredient.id map from user's ingredients
  const { data: userIngredients } = useIngredients();
  const shopToIngredientMap = useMemo(() => {
    const map = new Map<string, { ingredientId: string; name: string }>();
    userIngredients?.forEach((ui) => {
      if (ui.shopIngredientId) {
        const displayName =
          ui.shopIngredient?.name ??
          ui.customUserIngredient?.name ??
          "Unnamed";
        map.set(ui.shopIngredientId, {
          ingredientId: ui.id,
          name: displayName,
        });
      }
    });
    return map;
  }, [userIngredients]);

  // Sync initial data when groupId changes (edit mode switch)
  useEffect(() => {
    setName(initialName);
    setIngredients(resolveInitialIngredients(initialIngredients));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Build the selected set for the picker (matches composite key format)
  const selectedSet = useMemo(
    () => new Set(ingredients.map((i) => compositeKey(i.source, i.originalId))),
    [ingredients]
  );

  // Picker toggle handler
  const handlePickerToggle = useCallback(
    (item: PickedIngredient) => {
      const key = compositeKey(item.source, item.id);

      setIngredients((prev) => {
        const exists = prev.some(
          (i) => compositeKey(i.source, i.originalId) === key
        );

        if (exists) {
          // Deselect
          return prev.filter(
            (i) => compositeKey(i.source, i.originalId) !== key
          );
        }

        if (item.source === "user") {
          // User ingredient — id IS the Ingredient.id
          return [
            ...prev,
            {
              source: "user",
              originalId: item.id,
              ingredientId: item.id,
              name: item.name,
            },
          ];
        }

        // Shop ingredient — try to resolve from the lookup map
        const resolved = shopToIngredientMap.get(item.id);
        if (resolved) {
          return [
            ...prev,
            {
              source: "shop",
              originalId: item.id,
              ingredientId: resolved.ingredientId,
              name: item.name,
            },
          ];
        }

        // User doesn't have this ingredient yet — add with placeholder,
        // will be auto-created at submit time
        return [
          ...prev,
          {
            source: "shop",
            originalId: item.id,
            ingredientId: "", // resolved at submit
            name: item.name,
          },
        ];
      });
    },
    [shopToIngredientMap]
  );

  const removeIngredient = (source: IngredientSource, originalId: string) => {
    const key = compositeKey(source, originalId);
    setIngredients((prev) =>
      prev.filter((i) => compositeKey(i.source, i.originalId) !== key)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    startTransition(async () => {
      // Resolve any shop ingredients that still need an Ingredient record
      const resolvedIds: string[] = [];

      for (const ing of ingredients) {
        if (ing.ingredientId) {
          resolvedIds.push(ing.ingredientId);
          continue;
        }

        // Auto-create Ingredient for this ShopIngredient
        const result = await ensureIngredientForShopAction(ing.originalId);
        if (!result.success) {
          setError(result.error);
          return;
        }
        resolvedIds.push(result.data!.id);
      }

      const result = isEditing
        ? await updateGroupAction(groupId, name.trim(), resolvedIds)
        : await createGroupAction(name.trim(), resolvedIds);

      if (!result.success) {
        setError(result.error);
      } else {
        await mutate();
        // Refresh ingredients cache in case new ones were auto-created
        await mutateIngredients();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Group name */}
      <div className="space-y-2">
        <label htmlFor="groupName" className="text-sm font-medium">
          Group name
        </label>
        <Input
          id="groupName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          placeholder="e.g. Baking Essentials, Breakfast Items"
          autoFocus
        />
      </div>

      {/* Ingredient Picker (collapsible) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium w-full text-left"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${pickerOpen ? "" : "-rotate-90"}`}
          />
          Browse Ingredients
          {ingredients.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({ingredients.length} selected)
            </span>
          )}
        </button>
        {pickerOpen && (
          <div className="border rounded-lg p-3">
            <IngredientPicker
              selected={selectedSet}
              onToggle={handlePickerToggle}
              disabled={isPending}
            />
          </div>
        )}
      </div>

      {/* Selected ingredients */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Selected Ingredients ({ingredients.length})
        </label>

        {ingredients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Browse and click ingredients above to add them to this group.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ing) => (
              <span
                key={compositeKey(ing.source, ing.originalId)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {ing.name}
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.source, ing.originalId)}
                  disabled={isPending}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update group"
              : "Create group"}
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
