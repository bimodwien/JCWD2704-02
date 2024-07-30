-- AlterTable
ALTER TABLE `orders` MODIFY `cancelledBy` ENUM('user', 'superAdmin', 'storeAdmin', 'system') NULL,
    MODIFY `checkedBy` ENUM('user', 'superAdmin', 'storeAdmin', 'system') NULL,
    MODIFY `confirmedBy` ENUM('user', 'superAdmin', 'storeAdmin', 'system') NULL;
