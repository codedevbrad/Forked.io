import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { discoverShorts } from "../data/discover-shorts";

/** Seeds DiscoverVideo records from prisma/seed/data/discover-shorts.ts data. */
export async function seedDiscoverVideos(prisma: PrismaClient) {
  console.log("🌱 Seeding discover videos...");

  await prisma.discoverVideo.deleteMany();

  for (const video of discoverShorts) {
    await prisma.discoverVideo.create({
      data: {
        name: video.name,
        description: video.description,
        url: video.url,
        type: video.type,
      },
    });
    console.log(`✅ Seeded discover video: ${video.name}`);
  }

  console.log("✨ Discover videos seeding completed!");
}

// Only run when executed directly (e.g. npx tsx prisma/seed/scripts/discovervids.seed.ts)
const isEntry = process.argv[1]?.includes("discovervids.seed") ?? false;

if (isEntry) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  seedDiscoverVideos(prisma)
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
