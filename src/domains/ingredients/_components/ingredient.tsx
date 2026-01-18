"use client";

import { IngredientType, StorageType } from "@prisma/client";
import { cn } from "@/src/lib/utils";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
};

type IngredientData = {
  id: string;
  name: string;
  type: IngredientType;
  storageType: StorageType | null;
  tag: Tag[];
  category: Category | null;
};

type IngredientTitleWithPillsProps = {
  ingredient: IngredientData;
  className?: string;
};


export function IngredientInputDisplay({ ingredient, className }: IngredientTitleWithPillsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-base">{ingredient.name}</h3>
    </div>
  );
} 

export function IngredientTitleWithPills({
  ingredient,
  className,
}: IngredientTitleWithPillsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-base">{ingredient.name}</h3>
      <div className="flex flex-wrap gap-1.5">
        {/* Type Pill */}
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
        >
          {ingredient.type}
        </span>

        {/* Storage Type Pill */}
        {ingredient.storageType && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
          >
            {ingredient.storageType}
          </span>
        )}

        {/* Category Pill */}
        {ingredient.category && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${ingredient.category.color}20`,
              color: ingredient.category.color,
              border: `1px solid ${ingredient.category.color}40`,
            }}
          >
            
            {ingredient.category.name}
          </span>
        )}

        {/* Tag Pills */}
        {ingredient.tag.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}40`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}

type IngredientCardProps = {
  ingredient: Partial<IngredientData> & { id: string; name: string };
  isEditing?: boolean;
  editComponent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  showPills?: boolean;
};

export function IngredientCard({
  ingredient,
  isEditing = false,
  editComponent,
  className,
  children,
  actions,
  showPills = true,
}: IngredientCardProps) {
  if (isEditing && editComponent) {
    return (
      <div className={cn("p-4 border rounded-lg space-y-2", className)}>
        {editComponent}
      </div>
    );
  }

  const hasFullData = ingredient.type && ingredient.storageType !== undefined;

  return (
    <div className={cn("p-3 border rounded-lg space-y-2", className)}>
      {showPills && hasFullData ? (
        <IngredientTitleWithPills ingredient={ingredient as IngredientData} />
      ) : (
        <div className="space-y-2">
          <h3 className="font-medium text-base">{ingredient.name}</h3>
        </div>
      )}
      {children && <div className="mt-2">{children}</div>}
      {actions && <div className="flex items-center justify-end gap-2 mt-2">{actions}</div>}
    </div>
  );
}
