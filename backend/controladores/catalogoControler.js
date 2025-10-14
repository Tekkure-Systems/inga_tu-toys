import db from '.../config/db.js';
//obtener los productos
export const obtenerProductos = (req, res) =>{
    const sql = 'SELECT * FROM PRODUCTO';
    db.query(sql, (err, result) => {
        if(err) {
            console.error('Error al obtener productos: ', err);
            return res.status(500).json({error: 'Error al obtener las productos'});
        }
    res.json(results);
    });
};