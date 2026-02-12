import { Unit } from "@prisma/client";

export type ShoppingListIngredient = {
  id: string;

  // User-owned ingredient (set when source is a user Ingredient)
  ingredientId?: string | null;
  ingredient?: {
    id: string;
    shopIngredient?: { name: string } | null;
    customUserIngredient?: { name: string } | null;
  } | null;

  // Direct ShopIngredient reference (set when source is the system catalog)
  shopIngredientId?: string | null;
  shopIngredient?: {
    id: string;
    name: string;
  } | null;

  quantity: number;
  unit: Unit;
  recipe?: {
    id: string;
    name: string;
  } | null;
};

export type ShoppingList = {
  id: string;
  name: string;
  ingredients: ShoppingListIngredient[];
  recipes?: Array<{
    id: string;
    recipe: {
      id: string;
      name: string;
    };
  }>;
};
