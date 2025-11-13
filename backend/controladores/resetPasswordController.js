import db from '../config/bd.js';
import dotenv from 'dotenv';

dotenv.config();

export const resetPassword = (req, res) => {
    const { id_cliente, token, password } = req.body;

    if (!id_cliente || !token || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar que la contraseña sea segura (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' 
        });
    }

    // Buscar el cliente con el token válido y que no haya expirado
    const sql = 'SELECT id_cliente, resetPasswordToken, resetPasswordExpires FROM cliente WHERE id_cliente = ? AND resetPasswordToken = ? AND resetPasswordExpires > NOW() LIMIT 1';
    
    db.query(sql, [id_cliente, token], (err, results) => {
        if (err) {
            console.error('Error consultando cliente:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (!results || results.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        // Limpiar espacios en blanco al inicio/final de la contraseña antes de guardarla
        const cleanedPassword = password.trim();
        console.log('🔐 Restableciendo contraseña para cliente:', id_cliente);
        console.log('📏 Longitud contraseña original:', password ? password.length : 0);
        console.log('📏 Longitud contraseña limpiada:', cleanedPassword.length);

        // Guardar la contraseña en texto plano (sin hash)
        const updateSql = 'UPDATE cliente SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id_cliente = ?';
        
        db.query(updateSql, [cleanedPassword, id_cliente], (err) => {
            if (err) {
                console.error('❌ Error actualizando contraseña:', err);
                return res.status(500).json({ error: 'Error al actualizar la contraseña' });
            }

            console.log('✅ Contraseña actualizada exitosamente para cliente:', id_cliente);
            return res.status(200).json({ 
                message: 'Contraseña restablecida exitosamente' 
            });
        });
    });
};
