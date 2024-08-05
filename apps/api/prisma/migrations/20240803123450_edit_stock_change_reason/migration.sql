-- AlterTable
ALTER TABLE `stock_histories` MODIFY `reason` ENUM('restock', 'newStock', 'orderCancellation', 'orderPlacement', 'other') NOT NULL;
