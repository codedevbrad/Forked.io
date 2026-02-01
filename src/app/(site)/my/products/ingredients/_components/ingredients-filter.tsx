"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { IngredientType, StorageType } from "@prisma/client";
import { X, Search, Filter } from "lucide-react";
import { useTags } from "@/src/domains/tags/_contexts/useTags";

/** Type/storageType from linked ShopIngredient (one-to-one) */
type Ingredient = {
  id: string;
  name: string;
  shopIngredient?: { type: string; storageType: string | null } | null;
  tag: Array<{ id: string; name: string; color: string }>;
};

type IngredientsFilterProps = {
  ingredients: Ingredient[];
  onFilterChange: (filtered: Ingredient[]) => void;
};

export function IngredientsFilter({ ingredients, onFilterChange }: IngredientsFilterProps) {
  const { data: tags } = useTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStorageType, setSelectedStorageType] = useState<string>("all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const filteredIngredients = useMemo(() => {
    let filtered = [...ingredients];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ingredient =>
        (ingredient.shopIngredient?.name ?? "").toLowerCase().includes(query)
      );
    }

    // Type filter (from ShopIngredient)
    if (selectedType !== "all") {
      filtered = filtered.filter(ingredient => ingredient.shopIngredient?.type === selectedType);
    }

    // Storage type filter (from ShopIngredient)
    if (selectedStorageType !== "all") {
      if (selectedStorageType === "none") {
        filtered = filtered.filter(ingredient => !ingredient.shopIngredient?.storageType);
      } else {
        filtered = filtered.filter(ingredient => ingredient.shopIngredient?.storageType === selectedStorageType);
      }
    }

    // Tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(ingredient =>
        selectedTagIds.every(tagId =>
          ingredient.tag.some(tag => tag.id === tagId)
        )
      );
    }

    return filtered;
  }, [ingredients, searchQuery, selectedType, selectedStorageType, selectedTagIds]);

  // Update parent when filtered results change
  useEffect(() => {
    onFilterChange(filteredIngredients);
  }, [filteredIngredients, onFilterChange]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStorageType("all");
    setSelectedTagIds([]);
  };

  const hasActiveFilters = searchQuery || selectedType !== "all" || selectedStorageType !== "all" || selectedTagIds.length > 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        <h3 className="font-semibold">Filter Ingredients</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={IngredientType.food}>Food</SelectItem>
              <SelectItem value={IngredientType.drink}>Drink</SelectItem>
              <SelectItem value={IngredientType.condiment}>Condiment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Storage Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Storage Type</label>
          <Select value={selectedStorageType} onValueChange={setSelectedStorageType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Storage</SelectItem>
              <SelectItem value="none">No Storage</SelectItem>
              <SelectItem value={StorageType.pantry}>Pantry</SelectItem>
              <SelectItem value={StorageType.fridge}>Fridge</SelectItem>
              <SelectItem value={StorageType.freezer}>Freezer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Results</label>
          <div className="flex items-center h-10 px-3 border rounded-md bg-background">
            <span className="text-sm">
              {filteredIngredients.length} of {ingredients.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {tags && tags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "ring-2 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: selectedTagIds.includes(tag.id)
                    ? `${tag.color}20`
                    : `${tag.color}10`,
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                  ringColor: tag.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
