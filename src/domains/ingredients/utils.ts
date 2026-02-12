/**
 * Returns the display name for an ingredient, supporting both ShopIngredient-linked
 * and CustomUserIngredient-linked ingredients.
 */
export function getIngredientDisplayName(ingredient: {
  shopIngredient?: { name: string } | null;
  customUserIngredient?: { name: string } | null;
}): string {
  return (
    ingredient.shopIngredient?.name ??
    ingredient.customUserIngredient?.name ??
    "Unnamed"
  );
}
