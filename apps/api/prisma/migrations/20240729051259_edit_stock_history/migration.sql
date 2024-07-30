/*
  Warnings:

  - You are about to alter the column `reason` on the `stock_histories` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - Added the required column `changeType` to the `stock_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stock_histories` ADD COLUMN `changeType` ENUM('in', 'out') NOT NULL,
    MODIFY `reason` ENUM('restock', 'orderCancellation', 'orderPlacement', 'other') NOT NULL;
