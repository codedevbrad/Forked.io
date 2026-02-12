import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.shopProduct.count();
  console.log(`Found ${count} ShopProduct records. Deleting...`);

  const deleted = await prisma.shopProduct.deleteMany();
  console.log(`Deleted ${deleted.count} ShopProduct records.`);
}

main()
  .catch((e) => {
    console.error("❌ Clean failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
