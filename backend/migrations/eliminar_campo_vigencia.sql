-- Script para eliminar el campo vigencia de la tabla producto
-- Ejecutar este script en tu base de datos MySQL/MariaDB

USE imagutoys;

-- Eliminar el campo vigencia de la tabla producto
ALTER TABLE `producto` DROP COLUMN `vigencia`;

