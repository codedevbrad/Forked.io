/*
  Warnings:

  - You are about to alter the column `price` on the `ShopProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Made the column `price` on table `ShopProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ShopProduct" ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;
