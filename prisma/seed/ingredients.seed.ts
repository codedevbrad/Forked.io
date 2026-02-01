import "dotenv/config"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@prisma/client"

import { IngredientType, StorageType } from "@prisma/client";

const INGREDIENTS: Array<{
  name: string;
  type: IngredientType;
  storageType: StorageType;
}> = [
  { name: "Milk (semi-skimmed or full)", type: "drink", storageType: "fridge" },
  { name: "Butter", type: "food", storageType: "fridge" },
  { name: "Eggs", type: "food", storageType: "fridge" },
  { name: "Cheese (cheddar)", type: "food", storageType: "fridge" },
  { name: "Greek yogurt", type: "food", storageType: "fridge" },
  { name: "Cooking oil spread (optional)", type: "food", storageType: "fridge" },
  { name: "Mayonnaise", type: "condiment", storageType: "fridge" },
  { name: "Ketchup", type: "condiment", storageType: "fridge" },
  { name: "Mustard", type: "condiment", storageType: "pantry" },
  { name: "Fresh herbs (parsley / coriander)", type: "food", storageType: "fridge" },
  { name: "Lemon", type: "food", storageType: "fridge" },
  { name: "Garlic", type: "food", storageType: "pantry" },
  { name: "Ginger", type: "food", storageType: "fridge" },
];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding ingredients...");

  for (const ing of INGREDIENTS) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: ing.name, userId: null },
    });
    if (existing) {
      await prisma.ingredient.update({
        where: { id: existing.id },
        data: { type: ing.type, storageType: ing.storageType },
      });
    } else {
      await prisma.ingredient.create({
        data: {
          name: ing.name,
          type: ing.type,
          storageType: ing.storageType,
          userId: null,
        },
      });
    }
    console.log(`✅ Seeded ingredient: ${ing.name}`);
  }

  console.log("✨ Ingredients seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });