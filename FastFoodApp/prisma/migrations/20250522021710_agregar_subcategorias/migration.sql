/*
  Warnings:

  - Added the required column `direccion` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `producto` ADD COLUMN `subcategoria` ENUM('ITALIANO', 'TOMATE_MAYO', 'VIENESA_MAYO', 'DINAMICO', 'COMPLETO', 'CHACARERO', 'BARROS_LUCO', 'A_LO_POBRE') NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `direccion` VARCHAR(191) NOT NULL,
    ADD COLUMN `telefono` VARCHAR(191) NOT NULL;
