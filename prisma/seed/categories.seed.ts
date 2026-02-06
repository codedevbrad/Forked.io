import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@prisma/client";
import { seedShopIngredients } from "./ingredients.seed";
import { categories } from "./data/categories";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  await seedShopIngredients(prisma);

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });