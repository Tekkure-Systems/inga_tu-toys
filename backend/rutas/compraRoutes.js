import express from 'express';
import { createPayPalOrder, capturePayPalOrder, getOrderStatus } from '../controladores/compraController.js';
const router = express.Router();
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order/:orderId', capturePayPalOrder);
router.get('/paypal/order-status/:orderId', getOrderStatus);
export default router;