-- Script para eliminar cualquier trigger que use vigencia
USE imagutoys;

-- Ver todos los triggers primero
SHOW TRIGGERS;

-- Eliminar triggers relacionados con producto (si existen)
DROP TRIGGER IF EXISTS producto_before_insert;
DROP TRIGGER IF EXISTS producto_after_insert;
DROP TRIGGER IF EXISTS producto_before_update;
DROP TRIGGER IF EXISTS producto_after_update;

-- Verificar estructura de la tabla
DESCRIBE producto;

-- Verificar columnas
SHOW COLUMNS FROM producto LIKE '%vigencia%';

