import db from '../config/bd.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const PAYPAL_ENV = (process.env.PAYPAL_ENV || 'sandbox') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID || 'AZo-aJq1B9byVdiXxpdh2HOm1tlo8aT-n9-aGSBMxNPcm9QDYdttu6AYTshKHGrh_bLZ9u4XMIgGOIK-';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'EDHmG96f5MYiqebPI3k-mX6v90_yZQ2Tcmda7ftJ8FXa7k2UMG_dJcqIdcvSfDxjcdu-vTV3K9YtaTZL';
async function getAccessToken() {
    if (!PAYPAL_CLIENT || !PAYPAL_SECRET) {
        throw new Error('Credenciales de PayPal no configuradas. Verifica tu archivo .env');
    }
    const resp = await fetch(`${PAYPAL_ENV}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64'),
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

function createCompraInDb(cliente, items, callback) {
    const getClienteSql = 'SELECT domicilio FROM cliente WHERE id_cliente = ? LIMIT 1';
    db.query(getClienteSql, [cliente], (err, results) => {
        if (err) return callback(err);
        if (!results || results.length === 0) return callback(new Error('Cliente no encontrado'));
        const dirId = results[0].domicilio;
        if (!dirId) return callback(new Error('El cliente no tiene dirección registrada'));
        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);
            const insertCompraSql = 'INSERT INTO compra (dir_envio, cliente) VALUES (?, ?)';
            db.query(insertCompraSql, [dirId, cliente], (err, result) => {
                if (err) return db.query('ROLLBACK', () => callback(err));
                const compraId = result.insertId;
                const insertPedidoSql = 'INSERT INTO pedido (cantidad, producto, compra) VALUES ?';
                const values = items.map(i => [1, i.id_producto, compraId]);
                
                db.query(insertPedidoSql, [values], (err) => {
                    if (err) return db.query('ROLLBACK', () => callback(err));
                    db.query('COMMIT', (err) => {
                        if (err) return db.query('ROLLBACK', () => callback(err));
                        callback(null, compraId);
                    });
                });
            });
        });
    });
}
export const createPayPalOrder = async (req, res) => {
    try {
        const {amount = '1.00', currency = 'MXN', cliente, items} = req.body;
        const token = await getAccessToken();
        const orderResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{amount: {currency_code: currency, value: amount}}],
                application_context: {
                    brand_name: 'Imagu Toys',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: 'http://localhost:4200/carrito',
                    cancel_url: 'http://localhost:4200/carrito'
                }
            })
        });
        const text = await orderResp.text();
        let order;
        try {
            order = JSON.parse(text);
        } catch (_) {
            order = text;
        }
        if (!orderResp.ok) {
            return res.status(502).json({error: 'paypal_create_failed', status: orderResp.status, body: order});
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({error: 'create-order-failed', detail: String(err)});
    }
};
export const capturePayPalOrder = async (req, res) => {
    const {orderId} = req.params;
    const {cliente, items} = req.body;
    try {
        const token = await getAccessToken();
        const capResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const text = await capResp.text();
        let capture;
        try {
            capture = JSON.parse(text);
        } catch (_) {
            capture = text;
        }
        if (!capResp.ok) {
            return res.status(502).json({error: 'paypal_capture_failed', status: capResp.status, body: capture});
        }
        if (capture.status === 'COMPLETED' && cliente && items && items.length > 0) {
            createCompraInDb(cliente, items, (err, compraId) => {
                if (err) {
                    return res.json({capture, compraPersisted: false, err: err.message});
                }
                return res.json({capture, compraPersisted: true, compraId});
            });
        } else {
            res.json({capture, compraPersisted: false});
        }
    } catch (err) {
        res.status(500).json({error: 'capture-order-failed', detail: String(err)});
    }
};