/*
  Warnings:

  - You are about to drop the column `city` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimay` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `city`,
    DROP COLUMN `isPrimay`,
    ADD COLUMN `cityId` INTEGER NOT NULL,
    ADD COLUMN `isChosen` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
