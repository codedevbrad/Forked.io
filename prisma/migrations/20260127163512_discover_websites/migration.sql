-- CreateEnum
CREATE TYPE "DiscoverType" AS ENUM ('YOUTUBE', 'TIKTOK', 'INSTAGRAM');

-- CreateTable
CREATE TABLE "DiscoverVideo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DiscoverType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoverVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeWebsites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeWebsites_pkey" PRIMARY KEY ("id")
);
