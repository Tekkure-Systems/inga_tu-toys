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
export const verificarAdmin = (req, res, next) => {
    next();
};
export const agregarProducto = (req, res) => {
    console.log('agregar producto');
    console.log('body:', JSON.stringify(req.body, null, 2));
    const { nombre, descripcion, precio, cantidad, imagen } = req.body;
    if (req.body.vigencia !== undefined) {
        console.warn('campo vigencia ignorado');
        delete req.body.vigencia;
    }
    if (!nombre || !descripcion || !precio || cantidad === undefined) {
        console.log('error: faltan campos');
        return res.status(400).json({ error: 'Nombre, descripción, precio y cantidad son requeridos' });
    }
    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: 'La cantidad debe ser un número positivo o cero' });
    }
    const columnas = ['nombre', 'descripcion', 'cantidad', 'precio', 'imagen'];
    const valores = [nombre, descripcion, cantidad, precio, imagen || null];
    const sql = `INSERT INTO producto (${columnas.join(', ')}) VALUES (${columnas.map(() => '?').join(', ')})`;
    console.log('sql:', sql);
    console.log('valores:', JSON.stringify(valores));
    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('error db:', err);
            return res.status(500).json({ error: 'Error al agregar el producto: ' + err.message });
        }
        console.log('producto agregado, id:', result.insertId);
        res.json({
            message: 'Producto agregado exitosamente',
            id_producto: result.insertId
        });
    });
};
export const actualizarProducto = (req, res) => {
    const { id_producto } = req.params;
    const { nombre, descripcion, precio, cantidad, imagen } = req.body;
    if (!id_producto) {
        return res.status(400).json({ error: 'ID del producto requerido' });
    }
    if (precio !== undefined && (isNaN(precio) || precio <= 0)) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (cantidad !== undefined && (isNaN(cantidad) || cantidad < 0)) {
        return res.status(400).json({ error: 'La cantidad debe ser un número positivo o cero' });
    }
    const updates = [];
    const values = [];
    if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre);
    }
    if (descripcion !== undefined) {
        updates.push('descripcion = ?');
        values.push(descripcion);
    }
    if (precio !== undefined) {
        updates.push('precio = ?');
        values.push(precio);
    }
    if (cantidad !== undefined) {
        updates.push('cantidad = ?');
        values.push(cantidad);
    }
    if (imagen !== undefined) {
        updates.push('imagen = ?');
        values.push(imagen);
    }
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }
    values.push(id_producto);
    const sql = `UPDATE producto SET ${updates.join(', ')} WHERE id_producto = ?`;
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('error al actualizar:', err);
            return res.status(500).json({ error: 'Error al actualizar el producto: ' + err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    });
};
export const eliminarProducto = (req, res) => {
    try {
        const { id_producto } = req.params;
        if (!id_producto) {
            return res.status(400).json({ error: 'ID del producto requerido' });
        }
        console.log('eliminando producto id:', id_producto);
        const productoId = parseInt(id_producto, 10);
        if (isNaN(productoId)) {
            return res.status(400).json({ error: 'ID del producto debe ser un número válido' });
        }
        const sql = 'DELETE FROM producto WHERE id_producto = ?';
        db.query(sql, [productoId], (err, result) => {
            if (err) {
                console.error('error al eliminar:', err);
                if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === '23000' || err.errno === 1451) {
                    return res.status(409).json({
                        error: 'No se puede eliminar el producto porque está siendo utilizado en pedidos existentes.'
                    });
                }
                return res.status(500).json({
                    error: 'Error al eliminar el producto',
                    details: err.message || 'Error desconocido'
                });
            }
            if (!result) {
                return res.status(500).json({ error: 'Error: No se recibió respuesta de la base de datos' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            console.log('producto eliminado, filas:', result.affectedRows);
            res.json({ message: 'Producto eliminado exitosamente' });
        });
    } catch (error) {
        console.error('error inesperado:', error);
        res.status(500).json({ error: 'Error inesperado al procesar la solicitud: ' + error.message });
    }
};
export const obtenerProductoPorId = (req, res) => {
    const { id_producto } = req.params;
    if (!id_producto) {
        return res.status(400).json({ error: 'ID del producto requerido' });
    }
    const sql = 'SELECT * FROM producto WHERE id_producto = ?';
    db.query(sql, [id_producto], (err, result) => {
        if (err) {
            console.error('error al obtener:', err);
            return res.status(500).json({ error: 'Error al obtener el producto' });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result[0]);
    });
};
