"use client";

import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useSystemIngredients } from "../_contexts/useSystemIngredients";
import { useCategories } from "@/src/domains/categories/_contexts/useCategories";
import { SystemIngredientEditDialog } from "./system-ingredient-edit-dialog";
import { SystemIngredientCreateDialog } from "./system-ingredient-create-dialog";
import type { SystemShopIngredientRow } from "../db";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import type { SystemShopIngredientProduct } from "../db";
import { ChevronLeft, ChevronRight, Package, Pencil, Plus, Search, X, ImageOff } from "lucide-react";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

export function SystemIngredientsList() {
  const { data: ingredients, isLoading, error, mutate } = useSystemIngredients();
  const { data: categories } = useCategories();

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SystemShopIngredientRow | null>(null);

  // ── Filters ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set()
  );
  const [page, setPage] = useState(1);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategoryIds(new Set());
    setPage(1);
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedCategoryIds.size > 0;

  // ── Filtered list ────────────────────────────────────
  const filteredIngredients = useMemo(() => {
    if (!ingredients) return [];

    let result = ingredients;

    // Filter by selected categories
    if (selectedCategoryIds.size > 0) {
      result = result.filter(
        (row) => row.categoryId != null && selectedCategoryIds.has(row.categoryId)
      );
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      result = result.filter((row) => row.name.toLowerCase().includes(q));
    }

    return result;
  }, [ingredients, selectedCategoryIds, searchQuery]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedIngredients = filteredIngredients.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // ── Handlers ─────────────────────────────────────────
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

      {/* ── Toolbar: search + add button ─────────────── */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search ingredients…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add ingredient
        </Button>
      </div>

      {/* ── Category filter pills ────────────────────── */}
      {categories && categories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategoryIds.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors " +
                  (isActive
                    ? "border-transparent text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50")
                }
                style={
                  isActive
                    ? { backgroundColor: cat.color }
                    : undefined
                }
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground ml-1 inline-flex items-center gap-1 text-sm transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Results count ────────────────────────────── */}
      {hasActiveFilters && ingredients && (
        <p className="text-muted-foreground mb-3 text-sm">
          Showing {filteredIngredients.length} of {ingredients.length} ingredients
        </p>
      )}

      {/* ── Ingredient grid ──────────────────────────── */}
      {filteredIngredients.length === 0 ? (
        <p className="text-muted-foreground">
          {hasActiveFilters
            ? "No ingredients match your filters."
            : "No ingredients yet."}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedIngredients.map((row) => (
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
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <span>
                    <span className="text-muted-foreground">Users using: </span>
                    <span className="font-medium">{row.userCount}</span>
                  </span>

                  {/* Product count pill with popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors " +
                          (row.products.length > 0
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80")
                        }
                      >
                        <Package className="h-3 w-3" />
                        {row.products.length} product{row.products.length === 1 ? "" : "s"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-86 p-0">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">
                          Products for {row.name}
                        </p>
                      </div>
                      {row.products.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No products matched yet.
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto divide-y">
                          {row.products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-2.5 px-3 py-2"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {product.productName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {product.retailer}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
