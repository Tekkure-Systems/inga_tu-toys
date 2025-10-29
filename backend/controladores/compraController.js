import db from '../config/bd.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const PAYPAL_ENV = 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const RETURN_URL = process.env.RETURN_URL;
const CANCEL_URL = process.env.CANCEL_URL;
async function getAccessToken() {
    const authString = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
    const resp = await fetch(`${PAYPAL_ENV}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + authString,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error('Token request failed: ' + text);
    }
    const data = await resp.json();
    return data.access_token;
}
function createCompraInDb(cliente, items, paypalTransactionId, paypalOrderId, callback) {
    const getClienteSql = 'SELECT domicilio FROM cliente WHERE id_cliente = ? LIMIT 1';   
    db.query(getClienteSql, [cliente], (err, results) => {
        if (err) return callback(err);
        if (!results || results.length === 0) {
            return callback(new Error('Cliente no encontrado'));
        }
        const dirId = results[0].domicilio;
        if (!dirId) {
            return callback(new Error('El cliente no tiene direccion registrada'));
        }
        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            const insertCompraSql = 'INSERT INTO compra (dir_envio, cliente) VALUES (?, ?)';
            db.query(insertCompraSql, [dirId, cliente], (err, result) => {
                if (err) {
                    return db.query('ROLLBACK', () => callback(err));
                }
                const compraId = result.insertId;
                const productosComprados = new Map();
                if (!Array.isArray(items)) {
                    return db.query('ROLLBACK', () => callback(new Error('Formato de items inválido')));
                }

                for (const item of items) {
                    const productoId = item.id_producto || item.producto;

                    if (!productoId) {
                        return db.query('ROLLBACK', () => callback(new Error('Item inválido sin ID de producto')));
                    }
                    const cantidadActual = productosComprados.get(productoId) || 0;
                    const cantidadItem = parseInt(item.cantidad) || 1;
                    productosComprados.set(productoId, cantidadActual + cantidadItem);
                }
                if (productosComprados.size === 0) {
                    return db.query('ROLLBACK', () => callback(new Error('No hay productos válidos en el pedido')));
                }

                const values = Array.from(productosComprados.entries()).map(([productoId, cantidad]) => {
                    if (!productoId) {
                        throw new Error('productoId es undefined al preparar values para SQL');
                    }
                    return [cantidad, productoId, compraId];
                });
                const insertPedidoSql = 'INSERT INTO pedido (cantidad, producto, compra) VALUES ?';
                db.query(insertPedidoSql, [values], (err) => {
                    if (err) {
                        return db.query('ROLLBACK', () => callback(err));
                    }
                    db.query('COMMIT', (err) => {
                        if (err) {
                            return db.query('ROLLBACK', () => callback(err));
                        }
                        callback(null, compraId);
                    });
                });
            });
        });
    });
}
export const createPayPalOrder = async (req, res) => {
    try {
        const amountValue = req.body.amount || '1.00';
        const currencyValue = req.body.currency || 'MXN';
        const cliente = req.body.cliente;
        const items = req.body.items;
        const token = await getAccessToken();
        const orderResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currencyValue,
                        value: amountValue
                    }
                }],
                application_context: {
                    brand_name: 'Imagu Toys',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: RETURN_URL + '?success=true',
                    cancel_url: CANCEL_URL + '?success=false'
                }
            })
        });
        const text = await orderResp.text();
        let order;
        try {
            order = JSON.parse(text);
        } catch (parseError) {
            order = text;
        }
        if (!orderResp.ok) {
            return res.status(502).json({
                error: 'paypal_create_failed',
                status: orderResp.status,
                body: order
            });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({
            error: 'create-order-failed',
            detail: String(err)
        });
    }
};
export const capturePayPalOrder = async (req, res) => {
    const orderId = req.params.orderId;
    const cliente = req.body.cliente;
    const items = req.body.items;
    let capture;
    try {
        const token = await getAccessToken();
        const capResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const text = await capResp.text();
        try {
            capture = JSON.parse(text);
        } catch (parseError) {
            capture = text;
        }
        if (!capResp.ok) {
            return res.status(502).json({
                error: 'paypal_capture_failed',
                status: capResp.status,
                body: capture
            });
        }
        let paypalTransactionId = null;
        if (capture.purchase_units?.[0]?.payments?.captures?.[0]) {
             paypalTransactionId = capture.purchase_units[0].payments.captures[0].id;
         }
        const isCompleted = capture.status === 'COMPLETED';
        const hasCliente = cliente !== null && cliente !== undefined;
        const hasItems = items && Array.isArray(items) && items.length > 0;
        if (!isCompleted || !hasCliente || !hasItems) {
            const itemsCount = items ? items.length : 0;
            return res.status(400).json({
                capture,
                compraPersisted: false,
                message: `Estado de captura: ${capture.status}. Cliente válido: ${hasCliente}, Items válidos: ${hasItems} (${itemsCount})`
            });
        }
        createCompraInDb(cliente, items, paypalTransactionId, orderId, (err, compraId) => {
            if (err) {
                return res.json({ 
                    capture,
                    compraPersisted: false,
                    err: err.message || String(err)
                });
            }
            return res.json({
                capture,
                compraPersisted: true,
                compraId,
                paypalTransactionId
            });
        });
    } catch (err) { 
        console.error('Error general en capturePayPalOrder:', err);
        if (!res.headersSent) { 
            res.status(500).json({
                error: 'capture-order-failed',
                detail: String(err)
            });
        } 
    }
};
export const getOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const token = await getAccessToken();
        const statusResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const text = await statusResp.text();
        let orderData;
        try {
            orderData = JSON.parse(text);
        } catch (parseError) {
            orderData = text;
        }
        if (!statusResp.ok) {
            return res.status(502).json({
                error: 'paypal_status_failed',
                status: statusResp.status,
                body: orderData
            });
        }
        res.json(orderData);
    } catch (err) {
        res.status(500).json({
            error: 'get-status-failed',
            detail: String(err)
        });
    }
};
