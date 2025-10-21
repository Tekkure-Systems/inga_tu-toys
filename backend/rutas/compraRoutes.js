import express from 'express';
import { createPayPalOrder, capturePayPalOrder } from '../controladores/compraController.js';
const router = express.Router();
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order/:orderId', capturePayPalOrder);
export default router;