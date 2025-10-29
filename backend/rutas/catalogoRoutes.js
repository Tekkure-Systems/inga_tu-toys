import express from 'express';
import {
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorId
} from '../controladores/catalogoController.js';

const router = express.Router();

// Rutas públicas
router.get('/productos', obtenerProductos);
router.get('/productos/:id_producto', obtenerProductoPorId);

// Rutas de inventario (administración) - IMPORTANTE: Estas rutas deben ir después de las rutas GET
router.post('/productos', agregarProducto);
router.put('/productos/:id_producto', actualizarProducto);
router.delete('/productos/:id_producto', eliminarProducto);

export default router;