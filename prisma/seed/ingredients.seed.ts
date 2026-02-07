import "dotenv/config"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, IngredientType, StorageType } from "@prisma/client"
import { ingredientsByCategory } from "./data/ingredients";

/** Seeds ShopIngredient records and connects each to its Category. */
export async function seedShopIngredients(prisma: PrismaClient) {
  console.log("🌱 Seeding ShopIngredients...");

  // Build a lookup map: category name → category id  (single query)
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  for (const group of ingredientsByCategory) {
    const categoryId = categoryMap.get(group.categoryName);

    if (!categoryId) {
      console.warn(`⚠️  Category not found: "${group.categoryName}" — ingredients will be created without a category`);
    }

    for (const item of group.items) {
      const existing = await prisma.shopIngredient.findFirst({
        where: { name: item.name },
      });

      if (existing) {
        // Backfill the category if the ingredient already exists but has no category
        if (!existing.categoryId && categoryId) {
          await prisma.shopIngredient.update({
            where: { id: existing.id },
            data: { categoryId },
          });
          console.log(`🔗 Updated category for: ${item.name} → ${group.categoryName}`);
        } else {
          console.log(`⏭️  Skipped (exists): ${item.name}`);
        }
        continue;
      }

      await prisma.shopIngredient.create({
        data: {
          name: item.name,
          type: item.type as IngredientType,
          storageType: item.storageType as StorageType,
          ...(categoryId && { categoryId }),
        },
      });
      console.log(`✅ Seeded: ${item.name} → ${group.categoryName}`);
    }
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
