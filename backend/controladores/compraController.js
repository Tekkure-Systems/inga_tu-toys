import db from '../config/bd.js';

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