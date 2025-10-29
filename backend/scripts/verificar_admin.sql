-- Script para verificar y crear administrador si no existe
-- Ejecuta esto en tu base de datos

-- Verificar si la tabla existe
SELECT COUNT(*) as tabla_existe 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'administrador';

-- Ver todos los administradores
SELECT * FROM administrador;

-- Si la tabla no existe o está vacía, ejecuta esto:
CREATE TABLE IF NOT EXISTS `administrador` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) DEFAULT NULL,
  `correo` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar administrador (si no existe)
INSERT IGNORE INTO `administrador` (`nombre`, `apellidos`, `correo`, `password`, `activo`) 
VALUES ('Admin', 'Sistema', 'admin@imagutoys.com', 'admin123', 1);

-- Verificar que se creó
SELECT * FROM administrador WHERE correo = 'admin@imagutoys.com';


