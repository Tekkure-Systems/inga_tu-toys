import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import catalogoRoutes from './rutas/catalogoRoutes.js';
import authRoutes from './rutas/authRoutes.js';
import compraRoutes from './rutas/compraRoutes.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto (un nivel arriba de backend)
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const app = express();
app.use(cors());
app.use(express.json());

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.use('/api/catalogo', catalogoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/compra', compraRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));