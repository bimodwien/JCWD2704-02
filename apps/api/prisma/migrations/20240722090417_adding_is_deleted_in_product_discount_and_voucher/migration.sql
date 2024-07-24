-- AlterTable
ALTER TABLE `product_discounts` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `vouchers` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
