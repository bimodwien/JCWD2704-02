/*
  Warnings:

  - You are about to drop the column `storeId` on the `order_items` table. All the data in the column will be lost.
  - Added the required column `storeId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_storeId_fkey`;

-- AlterTable
ALTER TABLE `order_items` DROP COLUMN `storeId`;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `storeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
