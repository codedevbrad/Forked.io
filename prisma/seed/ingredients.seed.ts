import "dotenv/config"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, IngredientType, StorageType } from "@prisma/client"
import { meatItems, fishItems, vegItems } from "./data/ingredients";

const INGREDIENTS = [
  ...meatItems,
  ...fishItems,
  ...vegItems,
] as Array<{ name: string; type: IngredientType; storageType: StorageType }>;

/** Seeds ShopIngredient records from prisma/seed/ingredients.ts data. */
export async function seedShopIngredients(prisma: PrismaClient) {
  console.log("🌱 Seeding ShopIngredients...");

  for (const item of INGREDIENTS) {
    const existing = await prisma.shopIngredient.findFirst({
      where: { name: item.name },
    });
    if (existing) {
      console.log(`⏭️  Skipped (exists): ${item.name}`);
      continue;
    }
    await prisma.shopIngredient.create({
      data: {
        name: item.name,
        type: item.type,
        storageType: item.storageType,
      },
    });
    console.log(`✅ Seeded ShopIngredient: ${item.name}`);
  }

  console.log("✨ ShopIngredients seeding completed!");
}

// Only run when executed directly (e.g. npx tsx prisma/seed/ingredients.seed.ts)
const isEntry = process.argv[1]?.includes("ingredients.seed") ?? false;

if (isEntry) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  seedShopIngredients(prisma)
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}