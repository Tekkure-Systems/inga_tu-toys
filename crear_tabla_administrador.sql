-- =============================================
-- Script para crear la tabla de administradores
-- Sistema de gestión de inventario - Imagu Toys
-- =============================================

-- Crear la tabla administrador
CREATE TABLE IF NOT EXISTS `administrador` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) DEFAULT NULL,
  `correo` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `activo` tinyint(1) DEFAULT 1 COMMENT '1 = activo, 0 = inactivo',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- Insertar administrador de ejemplo
-- =============================================
-- Credenciales por defecto:
-- Correo: admin@imagutoys.com
-- Password: admin123
-- 
-- IMPORTANTE: Cambiar el password en producción usando hash!
-- =============================================

INSERT INTO `administrador` (`nombre`, `apellidos`, `correo`, `password`, `activo`) VALUES
('Admin', 'Sistema', 'admin@imagutoys.com', 'admin123', 1);

-- =============================================
-- Para crear más administradores en el futuro:
-- =============================================
/*
INSERT INTO `administrador` (`nombre`, `apellidos`, `correo`, `password`, `activo`) VALUES
('Nombre', 'Apellidos', 'correo@ejemplo.com', 'password_segura', 1);
*/

-- =============================================
-- Verificar que se creó correctamente:
-- =============================================
-- SELECT * FROM administrador;


