import db from '../config/bd.js';
export const login = (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ error: 'correo y password requeridos' });
  const sql = 'SELECT id_cliente, nombre, apellidos, correo, domicilio FROM cliente WHERE correo = ? AND password = ? LIMIT 1';
  db.query(sql, [correo, password], (err, results) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (!results || results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = results[0];
    console.log('✅ Login exitoso para:', user.correo);
    return res.json({ user });
  });
};
export const register = (req, res) => {
  const { nombre, apellidos, correo, password, calle, municipio, estado, cp, no_exterior, fecha_nacimiento } = req.body;
  if (!correo || !password || !nombre) {
    return res.status(400).json({ error: 'nombre, correo y password son requeridos' });
  }
  const checkSql = 'SELECT id_cliente FROM cliente WHERE correo = ? LIMIT 1';
  db.query(checkSql, [correo], (err, results) => {
    if (err) {
      console.error('Error al verificar correo:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results && results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    if (calle || municipio || estado) {
      const insertDirSql = 'INSERT INTO direccion (calle, municipio, no_exterior, cp, estado) VALUES (?, ?, ?, ?, ?)';
      db.query(insertDirSql, [calle || '', municipio || '', no_exterior || null, cp || '', estado || ''], (err, dirResult) => {
        if (err) {
          console.error('Error al crear dirección:', err);
          return res.status(500).json({ error: 'Error al crear la dirección' });
        }
        const dirId = dirResult.insertId;
        insertCliente(dirId);
      });
    } else {
      insertCliente(null);
    }
    function insertCliente(dirId) {
      const insertClienteSql = 'INSERT INTO cliente (nombre, apellidos, correo, password, domicilio, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertClienteSql, [nombre, apellidos || '', correo, password, dirId, fecha_nacimiento || null], (err, result) => {
        if (err) {
          console.error('Error al crear cliente:', err);
          return res.status(500).json({ error: 'Error al crear el usuario: ' + err.message });
        }
        const id = result.insertId;
        console.log('✅ Registro exitoso - Cliente creado con id:', id);
        return res.status(201).json({ 
          success: true, 
          id, 
          user: { 
            id_cliente: id, 
            nombre, 
            apellidos, 
            correo, 
            domicilio: dirId,
            fecha_nacimiento
          } 
        });
      });
    }
  });
};