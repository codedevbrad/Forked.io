-- AlterTable
ALTER TABLE "RecipeWebsites" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "imageURL" TEXT NOT NULL DEFAULT 'https://via.placeholder.com/150',
ADD COLUMN     "logoURL" TEXT NOT NULL DEFAULT 'https://via.placeholder.com/150';
