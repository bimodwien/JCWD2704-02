-- AlterTable
ALTER TABLE `stock_histories` ADD COLUMN `orderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `stock_histories` ADD CONSTRAINT `stock_histories_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
