-- Script de migración para agregar campos de categoría y edad a la tabla producto
-- Ejecutar este script en la base de datos si los campos no existen

-- Verificar y agregar columna categoria si no existe
ALTER TABLE producto 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) NULL AFTER descripcion;

-- Verificar y agregar columna edad si no existe  
ALTER TABLE producto 
ADD COLUMN IF NOT EXISTS edad VARCHAR(50) NULL AFTER categoria;

-- Si tu versión de MySQL no soporta IF NOT EXISTS, usa este enfoque alternativo:
-- Primero verifica si las columnas existen antes de agregarlas:

-- ALTER TABLE producto 
-- ADD COLUMN categoria VARCHAR(100) NULL AFTER descripcion,
-- ADD COLUMN edad VARCHAR(50) NULL AFTER categoria;

-- Nota: Ajusta los tipos de datos y tamaños según tus necesidades

