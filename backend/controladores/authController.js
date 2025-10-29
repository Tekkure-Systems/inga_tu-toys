import db from '../config/bd.js';

// Función auxiliar para crear la tabla y el admin si no existen
function asegurarTablaAdmin(callback) {
    // Verificar si la tabla existe
    const checkTableSql = 'SHOW TABLES LIKE \'administrador\'';
    db.query(checkTableSql, [], (err, results) => {
        if (err) {
            console.error('Error verificando tabla:', err);
            return callback(false);
        }
        
        if (results && results.length > 0) {
            // La tabla existe
            callback(true);
        } else {
            // La tabla no existe, crearla
            console.log('La tabla administrador no existe, creándola...');
            const createTableSql = `
                CREATE TABLE administrador (
                    id_admin int(11) NOT NULL AUTO_INCREMENT,
                    nombre varchar(50) NOT NULL,
                    apellidos varchar(50) DEFAULT NULL,
                    correo varchar(40) NOT NULL,
                    password varchar(40) NOT NULL,
                    activo tinyint(1) DEFAULT 1,
                    fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id_admin),
                    UNIQUE KEY correo (correo)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
            `;
            
            db.query(createTableSql, [], (createErr) => {
                if (createErr) {
                    console.error('Error creando tabla administrador:', createErr);
                    return callback(false);
                }
                
                // Insertar admin por defecto
                const insertAdminSql = 'INSERT INTO administrador (nombre, apellidos, correo, password, activo) VALUES (?, ?, ?, ?, ?)';
                db.query(insertAdminSql, ['Admin', 'Sistema', 'admin@imagutoys.com', 'admin123', 1], (insertErr) => {
                    if (insertErr) {
                        console.error('Error insertando admin:', insertErr);
                    } else {
                        console.log('Admin creado exitosamente: admin@imagutoys.com');
                    }
                    callback(true);
                });
            });
        }
    });
}

export const login = (req, res) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
        return res.status(400).json({ error: 'correo y password requeridos' });
    }
    
    console.log('Intentando login con:', correo);
    
    // Asegurar que la tabla admin existe, luego buscar
    asegurarTablaAdmin((tablaExiste) => {
        if (!tablaExiste) {
            console.log('No se pudo crear/verificar tabla administrador, buscando solo cliente');
            buscarCliente();
            return;
        }
        
        // Buscar administrador
        const adminSql = 'SELECT id_admin, nombre, apellidos, correo FROM administrador WHERE correo = ? AND password = ? AND activo = 1 LIMIT 1';
        console.log('Buscando administrador con correo:', correo);
        db.query(adminSql, [correo, password], (err, adminResults) => {
            if (err) {
                console.error('Error al consultar administrador:', err.message);
                buscarCliente();
                return;
            }
            
            if (adminResults && adminResults.length > 0) {
                const admin = adminResults[0];
                console.log('Login exitoso como administrador:', admin.correo);
                return res.json({ 
                    user: {
                        id_admin: admin.id_admin,
                        id_cliente: admin.id_admin,
                        nombre: admin.nombre,
                        apellidos: admin.apellidos,
                        correo: admin.correo,
                        tipo: 'admin'
                    }
                });
            }
            
            // No es admin, buscar cliente
            console.log('No se encontró administrador, buscando cliente...');
            buscarCliente();
        });
    });
    
    function buscarCliente() {
        const sql = 'SELECT id_cliente, nombre, apellidos, correo, domicilio FROM cliente WHERE correo = ? AND password = ? LIMIT 1';
        db.query(sql, [correo, password], (err2, results) => {
            if (err2) {
                console.error('Error al consultar cliente:', err2);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            if (!results || results.length === 0) {
                return res.status(401).json({ error: 'Credenciales invalidas' });
            }
            const user = results[0];
            user.tipo = 'cliente';
            console.log('Login exitoso como cliente:', user.correo);
            return res.json({ user });
        });
    }
};
export const register = (req, res) => {
    const { nombre, apellidos, correo, password, calle, municipio, estado, cp, no_exterior, fecha_nacimiento } = req.body;
    if (!correo || !password || !nombre) {
        return res.status(400).json({ error: 'nombre, correo y password son requeridos' });
    }
    const checkSql = 'SELECT id_cliente FROM cliente WHERE correo = ? LIMIT 1';
    db.query(checkSql, [correo], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (results && results.length > 0) {
            return res.status(409).json({ error: 'El correo ya esta registrado' });
        }
        const hasDireccion = calle || municipio || estado;
        if (hasDireccion) {
            insertDireccionAndCliente();
        } else {
            insertCliente(null);
        }
        function insertDireccionAndCliente() {
            const calleValue = calle || '';
            const municipioValue = municipio || '';
            const estadoValue = estado || '';
            const cpValue = cp || '';
            const noExteriorValue = no_exterior || null;
            const insertDirSql = 'INSERT INTO direccion (calle, municipio, no_exterior, cp, estado) VALUES (?, ?, ?, ?, ?)';
            db.query(insertDirSql, [calleValue, municipioValue, noExteriorValue, cpValue, estadoValue], (err, dirResult) => {
                if (err) {
                    console.error('Error al insertar direccion:', err);
                    return res.status(500).json({ error: 'Error al crear la direccion' });
                }
                const dirId = dirResult.insertId;
                insertCliente(dirId);
            });
        }
        function insertCliente(dirId) {
            const apellidosValue = apellidos || '';
            const fechaNacimientoValue = fecha_nacimiento || null;
            const insertClienteSql = 'INSERT INTO cliente (nombre, apellidos, correo, password, domicilio, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(insertClienteSql, [nombre, apellidosValue, correo, password, dirId, fechaNacimientoValue], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear el usuario: ' + err.message });
                }
                const id = result.insertId;
                return res.status(201).json({
                    success: true,
                    id,
                    user: {
                        id_cliente: id,
                        nombre,
                        apellidos: apellidosValue,
                        correo,
                        domicilio: dirId,
                        fecha_nacimiento: fechaNacimientoValue
                    }
                });
            });
        }
    });
};