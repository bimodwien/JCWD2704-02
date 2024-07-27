/*
  Warnings:

  - Added the required column `stockId` to the `product_discounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_discounts` ADD COLUMN `stockId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stocks` ADD COLUMN `priceDiscount` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `product_discounts` ADD CONSTRAINT `product_discounts_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
