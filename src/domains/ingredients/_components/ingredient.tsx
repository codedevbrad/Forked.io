"use client";

import { IngredientType, StorageType } from "@prisma/client";
import { cn } from "@/src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { HelpCircle } from "lucide-react";

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

/** Type/category come from linked ShopIngredient (one-to-one) */
type IngredientData = {
  id: string;
  name: string;
  shopIngredient?: {
    type: IngredientType;
    storageType: StorageType | null;
    category: Category | null;
  } | null;
  tag: Tag[];
};

type IngredientTitleWithPillsProps = {
  ingredient: IngredientData;
  className?: string;
};


export function IngredientInputDisplay({ ingredient, className }: IngredientTitleWithPillsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-base">{getIngredientDisplayName(ingredient as Parameters<typeof getIngredientDisplayName>[0])}</h3>
    </div>
  );
} 

function getShop(ingredient: IngredientData) {
  return ingredient.shopIngredient ?? undefined;
}

/** True when ingredient has no linked ShopIngredient (name stored in customIngredient). */
function isCustomIngredient(ingredient: IngredientData & { customIngredient?: unknown }) {
  return !ingredient.shopIngredient;
}

function CustomPill() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 hover:bg-amber-200/80 dark:hover:bg-amber-900/50 transition-colors"
          aria-label="What does Custom mean?"
        >
          <HelpCircle className="w-3 h-3" />
          Custom
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-xs">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Custom</strong> ingredients were not matched to an existing item in the catalogue (e.g. when importing a recipe from a URL). The name was saved as entered so you can still use it in recipes and lists. You can later link it to a shop ingredient if one is added.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function IngredientTitleWithPills({
  ingredient,
  className,
}: IngredientTitleWithPillsProps) {
  const shop = getShop(ingredient);
  const isCustom = isCustomIngredient(ingredient as IngredientData & { customIngredient?: unknown });
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-base">{getIngredientDisplayName(ingredient as Parameters<typeof getIngredientDisplayName>[0])}</h3>
      <div className="flex flex-wrap gap-1.5">
        {/* Custom pill (no linked ShopIngredient) */}
        {isCustom && <CustomPill />}
        {/* Type Pill (from ShopIngredient) */}
        {shop?.type && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {shop.type}
          </span>
        )}

        {/* Storage Type Pill (from ShopIngredient) */}
        {shop?.storageType && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
          >
            {shop.storageType}
          </span>
        )}

        {/* Category Pill (from ShopIngredient) */}
        {shop?.category && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${shop.category.color}20`,
              color: shop.category.color,
              border: `1px solid ${shop.category.color}40`,
            }}
          >
            {shop.category.name}
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
  ingredient: Partial<IngredientData> & { id: string; name?: string };
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  showPills?: boolean;
};

export function IngredientCard({
  ingredient,
  className,
  children,
  actions,
  showPills = true,
}: IngredientCardProps) {
  const shop = getShop(ingredient as IngredientData);
  const hasFullData = Boolean(shop?.type);
  const isCustom = isCustomIngredient(ingredient as IngredientData & { customIngredient?: unknown });

  return (
    <div className={cn("p-3 border rounded-lg space-y-2", className)}>
      {showPills && hasFullData ? (
        <IngredientTitleWithPills ingredient={ingredient as IngredientData} />
      ) : (
        <div className="space-y-2">
          <h3 className="font-medium text-base">{getIngredientDisplayName(ingredient as Parameters<typeof getIngredientDisplayName>[0])}</h3>
          {showPills && isCustom && (
            <div className="flex flex-wrap gap-1.5">
              <CustomPill />
            </div>
          )}
        </div>
      )}
      {children && <div className="mt-2">{children}</div>}
      {actions && <div className="flex items-center justify-end gap-2 mt-2">{actions}</div>}
    </div>
  );
}
