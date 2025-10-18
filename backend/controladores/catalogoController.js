import db from '../config/bd.js';
export const obtenerProductos = (req, res) =>{
    const sql = 'SELECT * FROM producto';
    console.log('GET /api/catalogo/productos called');
    db.query(sql, (err, result) => {
        if(err) {
            console.error('Error al obtener productos: ', err);
            return res.status(500).json({error: 'Error al obtener las productos'});
        }
        console.log(`Returning ${Array.isArray(result) ? result.length : 0} products`);
        res.json(result);
    });
};