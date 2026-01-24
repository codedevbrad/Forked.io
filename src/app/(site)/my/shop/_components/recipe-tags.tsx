"use client";

type RecipeTagsProps = {
  recipes: Array<{
    id: string;
    recipe: {
      id: string;
      name: string;
    };
  }>;
};

export function RecipeTags({ recipes }: RecipeTagsProps) {
  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">Recipes:</p>
      <div className="flex flex-wrap gap-1 ml-4">
        {recipes.map((r) => (
          <span
            key={r.id}
            className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground"
          >
            {r.recipe.name}
          </span>
        ))}
      </div>
    </div>
  );
}
