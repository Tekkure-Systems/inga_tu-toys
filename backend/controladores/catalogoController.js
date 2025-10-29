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

// Middleware para verificar si es administrador (opcional, si quieres usarlo)
export const verificarAdmin = (req, res, next) => {
    // Este middleware puede ser usado en rutas que requieren admin
    // Por ahora lo dejamos comentado, pero puedes usarlo si necesitas proteger rutas
    next();
};

// Controladores de inventario
export const agregarProducto = (req, res) => {
    console.log('=== AGREGAR PRODUCTO ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    // Extraer SOLO los campos que existen, IGNORAR vigencia y cualquier otro campo desconocido
    const { nombre, descripcion, precio, cantidad, imagen } = req.body;
    
    // Asegurarse de que NO se incluya vigencia (por si acaso viene en el body)
    if (req.body.vigencia !== undefined) {
        console.warn('ADVERTENCIA: Se recibió campo vigencia en el body, será ignorado');
        delete req.body.vigencia;
    }
    
    // Validación de campos requeridos
    if (!nombre || !descripcion || !precio || cantidad === undefined) {
        console.log('Error de validación: faltan campos requeridos');
        console.log('nombre:', nombre, 'descripcion:', descripcion, 'precio:', precio, 'cantidad:', cantidad);
        return res.status(400).json({ error: 'Nombre, descripción, precio y cantidad son requeridos' });
    }

    // Validación de tipos
    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: 'La cantidad debe ser un número positivo o cero' });
    }

    // IMPORTANTE: Solo usar campos que existen en la tabla producto (SIN vigencia)
    // ORDEN EXACTO: id_producto, nombre, descripcion, cantidad, precio, imagen (según schema SQL)
    
    // Construir query manualmente para asegurar que no hay vigencia
    const columnas = ['nombre', 'descripcion', 'cantidad', 'precio', 'imagen'];
    const valores = [nombre, descripcion, cantidad, precio, imagen || null];
    
    // Construir SQL de forma explícita para evitar cualquier modificación
    const sql = `INSERT INTO producto (${columnas.join(', ')}) VALUES (${columnas.map(() => '?').join(', ')})`;
    
    console.log('=== SQL A EJECUTAR ===');
    console.log('SQL COMPLETO:', sql);
    console.log('Columnas:', JSON.stringify(columnas));
    console.log('Valores:', JSON.stringify(valores));
    console.log('Cantidad columnas:', columnas.length);
    console.log('Cantidad valores:', valores.length);
    console.log('Verificando SQL:', sql.includes('vigencia') ? 'ERROR: CONTIENE VIGENCIA' : 'OK: NO CONTIENE VIGENCIA');
    console.log('========================');
    
    // Ejecutar query directamente
    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('=== ERROR EN DB ===');
            console.error('Error completo:', err);
            console.error('Error type:', typeof err);
            console.error('Error keys:', Object.keys(err));
            console.error('SQL Error Code:', err.code);
            console.error('SQL Errno:', err.errno);
            console.error('SQL Message:', err.message);
            console.error('SQL Statement recibido:', err.sql);
            console.error('SQL que enviamos:', sql);
            console.error('SQL coincide?', err.sql === sql ? 'SÍ' : 'NO - SE MODIFICÓ');
            if (err.sql && err.sql.includes('vigencia')) {
                console.error('¡¡¡ ERROR: El SQL que MySQL recibió CONTIENE VIGENCIA !!!');
                console.error('Esto significa que algo lo está modificando ANTES de llegar a MySQL');
            }
            console.error('===================');
            return res.status(500).json({ error: 'Error al agregar el producto: ' + err.message });
        }
        console.log('Producto agregado exitosamente. ID:', result.insertId);
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

    // Validación de tipos si se proporcionan
    if (precio !== undefined && (isNaN(precio) || precio <= 0)) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (cantidad !== undefined && (isNaN(cantidad) || cantidad < 0)) {
        return res.status(400).json({ error: 'La cantidad debe ser un número positivo o cero' });
    }

    // Construir query dinámicamente basado en los campos proporcionados
    // IMPORTANTE: Solo usar campos que existen (SIN vigencia)
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
            console.error('Error al actualizar producto:', err);
            console.error('SQL Error:', err.sql);
            console.error('SQL Message:', err.message);
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

        console.log('Intentando eliminar producto con ID:', id_producto);
        console.log('Tipo de id_producto:', typeof id_producto);

        // Convertir a número si es necesario
        const productoId = parseInt(id_producto, 10);
        if (isNaN(productoId)) {
            return res.status(400).json({ error: 'ID del producto debe ser un número válido' });
        }

        // Intentar eliminar directamente
        const sql = 'DELETE FROM producto WHERE id_producto = ?';
        db.query(sql, [productoId], (err, result) => {
            if (err) {
                console.error('Error al eliminar producto:', err);
                console.error('Código de error:', err.code);
                console.error('Errno:', err.errno);
                console.error('SQL State:', err.sqlState);
                console.error('Mensaje:', err.message);
                console.error('SQL:', err.sql);
                
                // Si es error de foreign key constraint
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
            
            console.log('Producto eliminado exitosamente. Filas afectadas:', result.affectedRows);
            res.json({ message: 'Producto eliminado exitosamente' });
        });
    } catch (error) {
        console.error('Error inesperado en eliminarProducto:', error);
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
            console.error('Error al obtener producto:', err);
            return res.status(500).json({ error: 'Error al obtener el producto' });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result[0]);
    });
};
