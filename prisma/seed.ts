import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding categories...");

  const categories = [
    {
      name: "Meat",
      color: "#dc2626", // Red
      icon: "meat",
    },
    {
      name: "Poultry",
      color: "#ea580c", // Orange-red
      icon: "poultry",
    },
    {
      name: "Fish",
      color: "#0284c7", // Blue
      icon: "fish",
    },
    {
      name: "Seafood",
      color: "#0891b2", // Cyan
      icon: "seafood",
    },
    {
      name: "Vegetables",
      color: "#16a34a", // Green
      icon: "vegetables",
    },
    {
      name: "Fruits",
      color: "#eab308", // Yellow
      icon: "fruits",
    },
    {
      name: "Dairy",
      color: "#fbbf24", // Amber
      icon: "dairy",
    },
    {
      name: "Grains",
      color: "#d97706", // Orange
      icon: "grains",
    },
    {
      name: "Legumes",
      color: "#a16207", // Dark orange
      icon: "legumes",
    },
    {
      name: "Nuts & Seeds",
      color: "#92400e", // Brown
      icon: "nuts",
    },
    {
      name: "Herbs & Spices",
      color: "#059669", // Emerald
      icon: "herbs",
    },
    {
      name: "Oils & Fats",
      color: "#f59e0b", // Amber
      icon: "oils",
    },
    {
      name: "Baking",
      color: "#f97316", // Orange
      icon: "baking",
    },
    {
      name: "Canned & Preserved",
      color: "#64748b", // Slate
      icon: "canned",
    },
    {
      name: "Snacks",
      color: "#ec4899", // Pink
      icon: "snacks",
    },
    {
      name: "Chocolate",
      color: "#92400e", // Brown
      icon: "chocolate",
    }
  ];

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