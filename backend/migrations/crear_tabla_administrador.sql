-- Script para crear la tabla de administradores
-- Esta tabla almacena los usuarios administradores que pueden gestionar el inventario

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

-- Insertar un administrador de ejemplo (cambiar password en producción)
-- Password: admin123
INSERT INTO `administrador` (`nombre`, `apellidos`, `correo`, `password`, `activo`) VALUES
('Admin', 'Sistema', 'admin@imagutoys.com', 'admin123', 1);


