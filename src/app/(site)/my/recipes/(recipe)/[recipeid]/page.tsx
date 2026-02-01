import Link from "next/link";
import Image from "next/image";
import { getRecipeAction } from "@/src/domains/recipes/db";
import { GoBackButton } from "@/src/components/custom/goBack";
import { Button } from "@/src/components/ui/button";
import { Pencil, ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ recipeid: string }>;
};

export default async function RecipePage({ params }: Props) {
  const { recipeid } = await params;
  const recipe = await getRecipeAction(recipeid);

  if (!recipe) {
    return (
      <div className="space-y-4">
        <GoBackButton text="Back to recipes" />
        <p className="text-muted-foreground">Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <GoBackButton text="Back to recipes" />
        <div className="flex items-center gap-2">
          {recipe.originalUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={recipe.originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Original recipe
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my/recipes?edit=${recipe.id}`}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <article className="border rounded-xl overflow-hidden bg-card">
        {recipe.image && (
          <div className="relative w-full aspect-16/10 sm:aspect-2/1 bg-muted">
            <Image
              src={recipe.image}
              alt={recipe.name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">{recipe.name}</h1>
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                    style={{
                      borderColor: tag.color,
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ri) => (
                  <li
                    key={ri.id}
                    className="flex items-baseline gap-2 text-muted-foreground"
                  >
                    <span className="text-foreground font-medium tabular-nums">
                      {ri.quantity} {ri.unit}
                    </span>
                    <span>{ri.ingredient.shopIngredient?.name ?? "Unnamed"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
