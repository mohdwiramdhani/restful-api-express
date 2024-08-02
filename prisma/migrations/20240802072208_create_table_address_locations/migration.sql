/*
  Warnings:

  - You are about to drop the column `location` on the `addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `location`;

-- CreateTable
CREATE TABLE `address_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `address_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address_locations` ADD CONSTRAINT `address_locations_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
