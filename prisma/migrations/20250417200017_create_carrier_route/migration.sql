-- AlterTable
ALTER TABLE `Shipment` ADD COLUMN `routeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Carrier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `origen` VARCHAR(191) NOT NULL,
    `destino` VARCHAR(191) NOT NULL,
    `capacidad` INTEGER NOT NULL,
    `carrierId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_carrierId_fkey` FOREIGN KEY (`carrierId`) REFERENCES `Carrier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
