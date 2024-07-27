-- AlterTable
ALTER TABLE `product_discounts` ADD COLUMN `buyQuantity` INTEGER NULL,
    ADD COLUMN `getQuantity` INTEGER NULL,
    ADD COLUMN `stockId` VARCHAR(191) NOT NULL DEFAULT 'default-stock-id';

-- AddForeignKey
ALTER TABLE `product_discounts` ADD CONSTRAINT `product_discounts_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
