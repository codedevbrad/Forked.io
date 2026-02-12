import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { categories } from "./data/categories";

/** Seeds Category records from prisma/seed/data/categories.ts data. */
export async function seedCategories(prisma: PrismaClient) {
  console.log("🌱 Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        color: category.color,
        icon: category.icon,
      },
      create: category,
    });
    console.log(`✅ Seeded category: ${category.name}`);
  }

  console.log("✨ Categories seeding completed!");
}

// Only run when executed directly (e.g. npx tsx prisma/seed/categories.seed.ts)
const isEntry = process.argv[1]?.includes("categories.seed") ?? false;

if (isEntry) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  seedCategories(prisma)
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
