-- AlterTable
ALTER TABLE "ShopProduct" ADD COLUMN     "size" INTEGER,
ADD COLUMN     "unit" "Unit",
ALTER COLUMN "price" DROP NOT NULL;
