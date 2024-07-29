-- DropForeignKey
ALTER TABLE `product_discounts` DROP FOREIGN KEY `product_discounts_stockId_fkey`;

-- AlterTable
ALTER TABLE `product_discounts` MODIFY `stockId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `product_discounts` ADD CONSTRAINT `product_discounts_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
