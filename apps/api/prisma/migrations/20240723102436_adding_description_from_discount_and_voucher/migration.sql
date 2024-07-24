/*
  Warnings:

  - Added the required column `description` to the `product_discounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_discounts` ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `vouchers` ADD COLUMN `description` VARCHAR(191) NOT NULL;
