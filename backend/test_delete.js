// Script de prueba para eliminar producto
import db from './config/bd.js';

const id_producto = 2;

console.log('Probando eliminación de producto con ID:', id_producto);

const sql = 'DELETE FROM producto WHERE id_producto = ?';
db.query(sql, [id_producto], (err, result) => {
    if (err) {
        console.error('ERROR:', err);
        console.error('Código:', err.code);
        console.error('Errno:', err.errno);
        console.error('Mensaje:', err.message);
    } else {
        console.log('ÉXITO - Filas afectadas:', result.affectedRows);
    }
    db.end();
});


