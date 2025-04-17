-- CreateTable
CREATE TABLE `Shipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `peso` DOUBLE NOT NULL,
    `dimensiones` VARCHAR(191) NOT NULL,
    `tipoProducto` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'En espera',
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
