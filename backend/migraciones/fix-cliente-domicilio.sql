-- Script de migración para reparar la estructura de la BD
-- Ejecuta estos comandos en MySQL/phpMyAdmin para la base de datos 'imagutoys'

-- 1. Eliminar la restricción de clave foránea en cliente.domicilio
ALTER TABLE cliente DROP FOREIGN KEY cliente_ibfk_1;

-- 2. Cambiar el tipo de dato de domicilio de INT a VARCHAR
ALTER TABLE cliente MODIFY domicilio VARCHAR(255) DEFAULT NULL;

-- 3. Agregar campos adicionales opcionales para dirección
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS calle VARCHAR(100);
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS municipio VARCHAR(50);
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS estado VARCHAR(50);
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS cp VARCHAR(10);

-- Verificar los cambios
SELECT * FROM cliente LIMIT 1;
