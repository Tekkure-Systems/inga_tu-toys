import db from '../config/bd.js';
export const obtenerProductos = (req, res) => {
    const sql = 'SELECT * FROM producto';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.json(result);
    });
};