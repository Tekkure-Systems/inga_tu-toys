import express from 'express';
import { checkout, createPayPalOrder, capturePayPalOrder } from '../controladores/compraController.js';
const router = express.Router();
router.post('/checkout', checkout);
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order/:orderId', capturePayPalOrder);
export default router;