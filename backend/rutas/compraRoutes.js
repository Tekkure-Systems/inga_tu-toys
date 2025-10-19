import { checkout, createPayPalOrder, capturePayPalOrder } from '../controladores/compraController.js';
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order/:orderId', capturePayPalOrder);
router.post('/checkout', checkout);
export default router;