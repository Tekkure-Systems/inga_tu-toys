import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './rutas/catalogoRoutes.js';
import authRoutes from './rutas/authRoutes.js';
import compraRoutes from './rutas/compraRoutes.js';

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
//rutas
app.use('/api/catalogo',catalogoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/compra', compraRoutes);
//Puerto
const PORT= process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));