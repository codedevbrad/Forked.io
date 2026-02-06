/**
 * Returns the display name for an ingredient, supporting both ShopIngredient-linked
 * and custom-only ingredients (name in customIngredient JSON).
 */
export function getIngredientDisplayName(ingredient: {
  shopIngredient?: { name: string } | null;
  customIngredient?: unknown;
}): string {
  return (
    ingredient.shopIngredient?.name ??
    (ingredient.customIngredient as { name?: string } | null)?.name ??
    "Unnamed"
  );
}
