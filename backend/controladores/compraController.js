import db from '../config/bd.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const PAYPAL_ENV = (process.env.PAYPAL_ENV || 'sandbox') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Credenciales de PayPal con fallback hardcodeado
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID || 'AZo-aJq1B9byVdiXxpdh2HOm1tlo8aT-n9-aGSBMxNPcm9QDYdttu6AYTshKHGrh_bLZ9u4XMIgGOIK-';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'EDHmG96f5MYiqebPI3k-mX6v90_yZQ2Tcmda7ftJ8FXa7k2UMG_dJcqIdcvSfDxjcdu-vTV3K9YtaTZL';

// Validar que las credenciales estén presentes
if (!PAYPAL_CLIENT || !PAYPAL_SECRET) {
  console.error('⚠️ ADVERTENCIA: Credenciales de PayPal no configuradas');
  console.error('PAYPAL_CLIENT_ID:', PAYPAL_CLIENT ? 'Configurado' : 'NO CONFIGURADO');
  console.error('PAYPAL_SECRET:', PAYPAL_SECRET ? 'Configurado' : 'NO CONFIGURADO');
} else {
  console.log('✅ Credenciales de PayPal cargadas correctamente');
  console.log('PayPal Client ID (primeros 10 caracteres):', PAYPAL_CLIENT.substring(0, 10) + '...');
  console.log('PayPal Environment:', PAYPAL_ENV);
  console.log('Fuente:', process.env.PAYPAL_CLIENT_ID ? 'Variables de entorno (.env)' : 'Hardcodeadas (fallback)');
}

async function getAccessToken() {
  if (!PAYPAL_CLIENT || !PAYPAL_SECRET) {
    throw new Error('Credenciales de PayPal no configuradas. Verifica tu archivo .env');
  }

  console.log('Solicitando token de acceso a PayPal...');
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
    console.error('Error obteniendo token de PayPal:', text);
    throw new Error('Token request failed: ' + text);
  }

  const data = await resp.json();
  console.log('✅ Token de PayPal obtenido exitosamente');
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
        const values = items.map(i => [i.cantidad || 1, i.producto, compraId]);
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

export const checkout = (req, res) => {
  const { cliente, items } = req.body;
  
  console.log('POST /api/compra/checkout called with:', { cliente, itemsCount: items?.length });
  
  if (!cliente || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'cliente e items son requeridos' });
  }
  
  // Obtener la dirección del cliente primero
  const getClienteSql = 'SELECT domicilio FROM cliente WHERE id_cliente = ? LIMIT 1';
  db.query(getClienteSql, [cliente], (err, results) => {
    if (err) {
      console.error('Error obteniendo cliente:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (!results || results.length === 0) {
      console.error('Cliente no encontrado:', cliente);
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    const dirId = results[0].domicilio;
    console.log('Cliente encontrado, dirección:', dirId);
    
    if (!dirId) {
      console.error('Cliente sin dirección:', cliente);
      return res.status(400).json({ error: 'El cliente no tiene dirección registrada' });
    }
    db.query('START TRANSACTION', (err) => {
      if (err) {
        console.error('Error iniciando transacción:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }  
      const insertCompraSql = 'INSERT INTO compra (dir_envio, cliente) VALUES (?, ?)';
      db.query(insertCompraSql, [dirId, cliente], (err, result) => {
        if (err) {
          console.error('Error insertando compra:', err);
          db.query('ROLLBACK', () => {
            res.status(500).json({ error: 'Error al crear la compra: ' + err.message });
          });
          return;
        }
        const compraId = result.insertId;
        const insertPedidoSql = 'INSERT INTO pedido (cantidad, producto, compra) VALUES ?';
        const values = items.map(i => [i.cantidad || 1, i.producto, compraId]);
        db.query(insertPedidoSql, [values], (err) => {
          if (err) {
            db.query('ROLLBACK', () => {
              res.status(500).json({ error: 'Error al crear los pedidos: ' + err.message });
            });
            return;
          }
          db.query('COMMIT', (err) => {
            if (err) {
              db.query('ROLLBACK', () => {
                res.status(500).json({ error: 'Error al confirmar la compra' });
              });
              return;
            }
            res.json({ success: true, compraId });
          });
        });
      });
    });
  });
};

export const createPayPalOrder = async (req, res) => {
  try {
    const { amount = '1.00', currency = 'USD', cliente, items } = req.body;
    console.log('createPayPalOrder called with', { amount, currency, cliente, itemsCount: items?.length });
    const token = await getAccessToken();
    console.log('Obtained PayPal access token');

    const orderResp = await fetch(`${PAYPAL_ENV}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount } }],
        application_context: {
          brand_name: 'Ingatu Toys',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:4200/carrito',
          cancel_url: 'http://localhost:4200/carrito'
        }
      })
    });

    const text = await orderResp.text();
    let order;
    try { order = JSON.parse(text); } catch (_) { order = text; }

    if (!orderResp.ok) {
      console.error('PayPal create order failed', { status: orderResp.status, body: order });
      return res.status(502).json({ error: 'paypal_create_failed', status: orderResp.status, body: order });
    }

    console.log('PayPal order created:', order.id);
    res.json(order);
  } catch (err) {
    console.error('createPayPalOrder error', err);
    res.status(500).json({ error: 'create-order-failed', detail: String(err) });
  }
};

export const capturePayPalOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cliente, items } = req.body;
  try {
    console.log('capturePayPalOrder called', { orderId, cliente, itemsCount: items?.length });
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
    try { capture = JSON.parse(text); } catch (_) { capture = text; }

    if (!capResp.ok) {
      console.error('PayPal capture failed', { status: capResp.status, body: capture });
      return res.status(502).json({ error: 'paypal_capture_failed', status: capResp.status, body: capture });
    }

    console.log('PayPal capture successful:', capture.status);

    // Si la captura fue exitosa, persistir la compra en la BD
    if (capture.status === 'COMPLETED' && cliente && items && items.length > 0) {
      createCompraInDb(cliente, items, (err, compraId) => {
        if (err) {
          console.error('Error creando compra tras captura:', err);
          return res.json({ capture, compraPersisted: false, err: err.message });
        }
        console.log('Compra persistida con ID:', compraId);
        return res.json({ capture, compraPersisted: true, compraId });
      });
    } else {
      res.json({ capture, compraPersisted: false });
    }
  } catch (err) {
    console.error('capturePayPalOrder error', err);
    res.status(500).json({ error: 'capture-order-failed', detail: String(err) });
  }
};
