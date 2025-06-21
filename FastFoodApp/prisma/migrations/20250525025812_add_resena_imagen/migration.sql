/*
  Warnings:

  - You are about to drop the column `subcategoria` on the `producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `producto` DROP COLUMN `subcategoria`,
    ADD COLUMN `imagen` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Resena` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contenido` VARCHAR(191) NOT NULL,
    `calificacion` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resena` ADD CONSTRAINT `Resena_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resena` ADD CONSTRAINT `Resena_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
