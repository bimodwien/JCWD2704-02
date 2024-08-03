-- AlterTable
ALTER TABLE `orders` ADD COLUMN `shippedBy` ENUM('user', 'superAdmin', 'storeAdmin', 'system') NULL;
