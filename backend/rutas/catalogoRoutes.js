import express from 'express';
import {
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorId
} from '../controladores/catalogoController.js';
const router = express.Router();
router.get('/productos', obtenerProductos);
router.get('/productos/:id_producto', obtenerProductoPorId);
router.post('/productos', agregarProducto);
router.put('/productos/:id_producto', actualizarProducto);
router.delete('/productos/:id_producto', eliminarProducto);
export default router;
