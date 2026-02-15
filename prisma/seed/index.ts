import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./scripts/categories.seed";
import { seedShopIngredients } from "./scripts/ingredients.seed";
import { seedDiscoverVideos } from "./scripts/discovervids.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedCategories(prisma);
  await seedShopIngredients(prisma);
  await seedDiscoverVideos(prisma);

  console.log("✨ All seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
