/*
  Warnings:

  - You are about to drop the column `buyQuantity` on the `product_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `getQuantity` on the `product_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `stockId` on the `product_discounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `product_discounts` DROP FOREIGN KEY `product_discounts_stockId_fkey`;

-- AlterTable
ALTER TABLE `product_discounts` DROP COLUMN `buyQuantity`,
    DROP COLUMN `getQuantity`,
    DROP COLUMN `stockId`;
