import express from 'express';
import { checkout } from '../controladores/compraController.js';
const router = express.Router();

router.post('/checkout', checkout);

export default router;

