"use client";

import { useState, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { useIngredients } from "@/src/domains/ingredients/_contexts/useIngredients";
import { useShopIngredients } from "@/src/domains/shop/_contexts/useShopIngredients";
import { useCategories } from "@/src/domains/shop/_contexts/useCategories";
import { Check, ChevronLeft, ChevronRight, Search, User } from "lucide-react";

export type IngredientSource = "user" | "shop";

export type PickedIngredient = {
  source: IngredientSource;
  id: string;
  name: string;
  categoryId?: string | null;
};

type IngredientPickerProps = {
  /** Set of currently selected composite keys ("user:id" or "shop:id"). */
  selected: Set<string>;
  /** Called when user toggles an ingredient. */
  onToggle: (item: PickedIngredient) => void;
  disabled?: boolean;
};

const ITEMS_PER_PAGE = 10;

/** Unified item for the browsable list. */
type BrowseItem = PickedIngredient;

function compositeKey(source: IngredientSource, id: string) {
  return `${source}:${id}`;
}

export function IngredientPicker({ selected, onToggle, disabled }: IngredientPickerProps) {
  const { data: userIngredients } = useIngredients();
  const { data: shopIngredients } = useShopIngredients();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [myIngredientsOnly, setMyIngredientsOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Build a set of shopIngredientIds that the user already "knows" (has an Ingredient linked to)
  const knownShopIngredientIds = useMemo(() => {
    const set = new Set<string>();
    userIngredients?.forEach((ui) => {
      if (ui.shopIngredientId) set.add(ui.shopIngredientId);
    });
    return set;
  }, [userIngredients]);

  // Build unified browse list
  const allItems: BrowseItem[] = useMemo(() => {
    const items: BrowseItem[] = [];

    // Shop ingredients (system catalog)
    shopIngredients?.forEach((si) => {
      items.push({
        source: "shop",
        id: si.id,
        name: si.name,
        categoryId: si.categoryId,
      });
    });

    // User custom ingredients (those not linked to a ShopIngredient, so they aren't duplicated)
    userIngredients?.forEach((ui) => {
      if (!ui.shopIngredientId) {
        const name = getIngredientDisplayName(ui);
        const catId = ui.customUserIngredient?.category?.id ?? null;
        items.push({
          source: "user",
          id: ui.id,
          name,
          categoryId: catId,
        });
      }
    });

    return items;
  }, [shopIngredients, userIngredients]);

  // Apply filters
  const filtered = useMemo(() => {
    let list = allItems;

    // "My Ingredients" toggle: only show shop ingredients the user knows, plus all user custom ingredients
    if (myIngredientsOnly) {
      list = list.filter((item) => {
        if (item.source === "user") return true; // always show user's own custom
        return knownShopIngredientIds.has(item.id);
      });
    }

    // Category filter
    if (categoryFilter) {
      list = list.filter((item) => item.categoryId === categoryFilter);
    }

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    return list;
  }, [allItems, myIngredientsOnly, categoryFilter, search, knownShopIngredientIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {/* Controls row: category pills + My Ingredients toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* My Ingredients toggle */}
        <button
          type="button"
          onClick={() => { setMyIngredientsOnly(!myIngredientsOnly); resetPage(); }}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            myIngredientsOnly
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-accent"
          }`}
        >
          <User className="w-3 h-3" />
          My Ingredients
        </button>

        {/* Category filter pills */}
        <button
          type="button"
          onClick={() => { setCategoryFilter(null); resetPage(); }}
          disabled={disabled}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            categoryFilter === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-accent"
          }`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => { setCategoryFilter(categoryFilter === cat.id ? null : cat.id); resetPage(); }}
            disabled={disabled}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} ingredient{filtered.length !== 1 ? "s" : ""} found
        {selected.size > 0 && <span className="ml-2 font-medium">({selected.size} selected)</span>}
      </p>

      {/* Ingredient grid */}
      {paginated.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No ingredients match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {paginated.map((item) => {
            const key = compositeKey(item.source, item.id);
            const isSelected = selected.has(key);
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(item)}
                className={`relative flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border hover:bg-accent"
                }`}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
                <span className={`truncate ${isSelected ? "font-medium" : ""}`}>
                  {item.name}
                </span>
                {item.source === "user" && (
                  <User className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={disabled || safePage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={disabled || safePage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
