-- Ejecuta este SQL en tu base de datos imagutoys

-- Crear tabla si no existe
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

-- Eliminar admin anterior si existe (para evitar duplicados)
DELETE FROM `administrador` WHERE `correo` = 'admin@imagutoys.com';

-- Insertar el administrador
INSERT INTO `administrador` (`nombre`, `apellidos`, `correo`, `password`, `activo`) 
VALUES ('Admin', 'Sistema', 'admin@imagutoys.com', 'admin123', 1);

-- Verificar que se creó correctamente
SELECT * FROM `administrador` WHERE `correo` = 'admin@imagutoys.com';


