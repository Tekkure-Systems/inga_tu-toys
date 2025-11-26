import db from '../config/bd.js';
import bcrypt from 'bcrypt';

export const login = (req, res) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
        return res.status(400).json({ error: 'correo y password requeridos' });
    }
    console.log('login con:', correo);
    
    const sql = 'SELECT id_cliente, nombre, apellidos, correo, domicilio, password, administrador FROM cliente WHERE correo = ? LIMIT 1';
    db.query(sql, [correo], async (err, results) => {
        if (err) {
            console.error('error consultando cliente:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }
        
        const user = results[0];
        const storedPassword = user.password;
        
        console.log('Verificando contrasena para:', correo);
        console.log('Longitud contrasena recibida:', password ? password.length : 0);
        console.log('Longitud contrasena almacenada:', storedPassword ? storedPassword.length : 0);
        console.log('Tipo de contrasena almacenada:', storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) ? 'Hash bcrypt' : 'Texto plano');
        
        let passwordMatch = false;
        
        try {
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'))) {
                console.log('Comparando con bcrypt...');
                passwordMatch = await bcrypt.compare(password, storedPassword);
            } else {
                console.log('Comparando en texto plano...');
                const trimmedPassword = password ? password.trim() : '';
                const trimmedStored = storedPassword ? storedPassword.trim() : '';
                passwordMatch = trimmedPassword === trimmedStored;
                console.log('Comparacion texto plano:', passwordMatch);
            }
        } catch (error) {
            console.error('Error comparando contrasena:', error);
            return res.status(500).json({ error: 'Error al verificar la contrasena' });
        }
        
        if (!passwordMatch) {
            console.log('Contrasena no coincide');
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }
        
        console.log('Contrasena valida');
        
        delete user.password;
        
        user.tipo = user.administrador === 1 ? 'admin' : 'cliente';
        
        const tipoUsuario = user.tipo === 'admin' ? 'admin' : 'cliente';
        console.log(`login ${tipoUsuario}:`, user.correo);
        return res.json({ user });
    });
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
