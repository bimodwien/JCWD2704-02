/*
  Warnings:

  - Added the required column `category` to the `product_discounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `vouchers` DROP FOREIGN KEY `vouchers_productId_fkey`;

-- AlterTable
ALTER TABLE `product_discounts` ADD COLUMN `category` ENUM('buyGet', 'discount') NOT NULL,
    MODIFY `type` ENUM('percentage', 'nominal') NULL,
    MODIFY `value` DOUBLE NULL;

-- AlterTable
ALTER TABLE `vouchers` MODIFY `productId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('percentage', 'nominal') NULL,
    MODIFY `value` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
