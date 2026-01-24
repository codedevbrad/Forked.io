import { Unit } from "@prisma/client";

export type ShoppingListIngredient = {
  id: string;
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
  };
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
