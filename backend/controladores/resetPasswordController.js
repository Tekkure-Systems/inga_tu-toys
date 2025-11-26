import db from '../config/bd.js';
import dotenv from 'dotenv';

dotenv.config();

export const resetPassword = (req, res) => {
    const { id_cliente, token, password } = req.body;

    if (!id_cliente || !token || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const sql = 'SELECT id_cliente, resetPasswordToken, resetPasswordExpires FROM cliente WHERE id_cliente = ? AND resetPasswordToken = ? AND resetPasswordExpires > NOW() LIMIT 1';
    
    db.query(sql, [id_cliente, token], (err, results) => {
        if (err) {
            console.error('Error consultando cliente:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (!results || results.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const cleanedPassword = password.trim();
        console.log('Restableciendo contrasena para cliente:', id_cliente);
        console.log('Longitud contrasena original:', password ? password.length : 0);
        console.log('Longitud contrasena limpiada:', cleanedPassword.length);

        const updateSql = 'UPDATE cliente SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id_cliente = ?';
        
        db.query(updateSql, [cleanedPassword, id_cliente], (err) => {
            if (err) {
                console.error('Error actualizando contrasena:', err);
                return res.status(500).json({ error: 'Error al actualizar la contrasena' });
            }

            console.log('Contrasena actualizada exitosamente para cliente:', id_cliente);
            return res.status(200).json({ 
                message: 'Contraseña restablecida exitosamente' 
            });
        });
    });
};
