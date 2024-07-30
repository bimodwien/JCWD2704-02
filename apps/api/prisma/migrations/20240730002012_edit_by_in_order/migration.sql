-- AlterTable
ALTER TABLE `orders` ADD COLUMN `cancelledBy` ENUM('user', 'superAdmin', 'storeAdmin') NULL,
    ADD COLUMN `checkedAt` DATETIME(3) NULL,
    ADD COLUMN `checkedBy` ENUM('user', 'superAdmin', 'storeAdmin') NULL,
    ADD COLUMN `confirmedBy` ENUM('user', 'superAdmin', 'storeAdmin') NULL;
