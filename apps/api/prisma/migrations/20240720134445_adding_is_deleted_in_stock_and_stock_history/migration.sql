-- AlterTable
ALTER TABLE `stock_histories` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `stocks` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
