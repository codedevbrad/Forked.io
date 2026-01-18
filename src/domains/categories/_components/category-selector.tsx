"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useCategories } from "@/src/domains/categories/_contexts/useCategories";

type CategorySelectorProps = {
  selectedCategoryId?: string | null;
  onSelectionChange: (categoryId: string | null) => void;
  disabled?: boolean;
};

export function CategorySelector({
  selectedCategoryId,
  onSelectionChange,
  disabled = false,
}: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="space-y-2">
      <label htmlFor="category" className="text-sm font-medium">
        Category
      </label>
      <Select
        value={selectedCategoryId || "__none__"}
        onValueChange={(value) => {
          onSelectionChange(value === "__none__" ? null : value);
        }}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {category.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
