-- AlterTable
ALTER TABLE `orders` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `confirmedAt` DATETIME(3) NULL,
    ADD COLUMN `processedAt` DATETIME(3) NULL;
