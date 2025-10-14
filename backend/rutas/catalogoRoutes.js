import express from 'express';
import {obtenerProductos} from '../controladores/catalogoController.js';
const router = express.Router();

//endpoints del catalogo
router.get('/productos', obtenerProductos);
export default router;
