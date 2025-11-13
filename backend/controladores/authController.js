import db from '../config/bd.js';
export const login = (req, res) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
        return res.status(400).json({ error: 'correo y password requeridos' });
    }
    console.log('login con:', correo);
    const adminSql = 'SELECT id_admin, nombre, apellidos, correo FROM administrador WHERE correo = ? AND password = ? AND activo = 1 LIMIT 1';
    db.query(adminSql, [correo, password], (err, adminResults) => {
        if (err) {
            console.error('error consultando administrador:', err.message);
            buscarCliente();
            return;
        }
        if (adminResults && adminResults.length > 0) {
            const admin = adminResults[0];
            console.log('login admin:', admin.correo);
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
        buscarCliente();
    });
    function buscarCliente() {
        const sql = 'SELECT id_cliente, nombre, apellidos, correo, domicilio FROM cliente WHERE correo = ? AND password = ? LIMIT 1';
        db.query(sql, [correo, password], (err2, results) => {
            if (err2) {
                console.error('error consultando cliente:', err2);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            if (!results || results.length === 0) {
                return res.status(401).json({ error: 'Credenciales invalidas' });
            }
            const user = results[0];
            user.tipo = 'cliente';
            console.log('login cliente:', user.correo);
            return res.json({ user });
        });
    }
};
export const register = (req, res) => {
    const { nombre, apellidos, correo, password, calle, municipio, estado, cp, no_exterior, fecha_nacimiento, tipo_usuario } = req.body;
    if (!correo || !password || !nombre || !apellidos || !calle || !municipio || !estado || !cp || !no_exterior || !fecha_nacimiento|| !tipo_usuario) {
        return res.status(400).json({ error: 'No se puede tener campos vacios' });
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
                    console.error('error insertando direccion:', err);
                    return res.status(500).json({ error: 'Error al crear la direccion' });
                }
                const dirId = dirResult.insertId;
                insertCliente(dirId);
            });
        }
        function insertCliente(dirId) {
            const apellidosValue = apellidos || '';
            const fechaNacimientoValue = fecha_nacimiento || null;
            let tipoUsuarioValue = false;
            if (tipo_usuario.toLowerCase() === "administrador"){
                tipoUsuarioValue = true;
            }
            const insertClienteSql = 'INSERT INTO cliente (nombre, apellidos, correo, password, domicilio, fecha_nacimiento, administrador) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(insertClienteSql, [nombre, apellidosValue, correo, password, dirId, fechaNacimientoValue, tipoUsuarioValue], (err, result) => {
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
                        fecha_nacimiento: fechaNacimientoValue,
                        tipo_usuario: tipoUsuarioValue
                    }
                });
            });
        }
    });
};
