-- AlterTable
ALTER TABLE `producto` ADD COLUMN `bebidaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Bebida` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Bebida_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_bebidaId_fkey` FOREIGN KEY (`bebidaId`) REFERENCES `Bebida`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
