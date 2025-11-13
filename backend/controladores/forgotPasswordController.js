import db from '../config/bd.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// dotenv ya se carga en servidor.js, no es necesario cargarlo aquí

export const forgotPassword = (req, res) => {
    console.log('📧 Petición recibida para recuperación de contraseña');
    console.log('Body recibido:', JSON.stringify(req.body));
    const { correo } = req.body;
    console.log('Correo recibido:', correo);

    if (!correo) {
        console.log('❌ Error: Correo no proporcionado');
        return res.status(400).json({ error: 'El correo es requerido' });
    }

    // Buscar el cliente por correo
    console.log('🔍 Buscando cliente en base de datos...');
    const sql = 'SELECT id_cliente, nombre, correo FROM cliente WHERE correo = ? LIMIT 1';
    
    // Agregar timeout a la consulta de base de datos
    const queryTimeout = setTimeout(() => {
        console.error('⏱️ Timeout en consulta a base de datos');
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Timeout en consulta a base de datos' });
        }
    }, 5000);
    
    db.query(sql, [correo], (err, results) => {
        clearTimeout(queryTimeout); // Limpiar timeout si la consulta termina
        
        if (err) {
            console.error('❌ Error consultando cliente:', err);
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            return;
        }

        console.log('📊 Resultados de búsqueda:', results ? results.length : 0, 'registros encontrados');

        if (!results || results.length === 0) {
            // Por seguridad, no revelamos si el correo existe o no
            console.log('⚠️ Correo no encontrado en la base de datos:', correo);
            if (!res.headersSent) {
                return res.status(200).json({ 
                    message: 'Si el correo existe, se enviará un enlace para restablecer la contraseña',
                    correoNoEncontrado: true
                });
            }
            return;
        }
        
        console.log('✅ Cliente encontrado:', results[0].nombre);

        const cliente = results[0];

        // Generar token JWT con expiración de 1 hora
        const token = jwt.sign(
            { id_cliente: cliente.id_cliente },
            process.env.JWT_SECRET || 'tu_secret_key_muy_segura',
            { expiresIn: '1h' }
        );

        // Guardar el token en la base de datos
        console.log('💾 Guardando token en base de datos para cliente:', cliente.id_cliente);
        const updateSql = 'UPDATE cliente SET resetPasswordToken = ?, resetPasswordExpires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id_cliente = ?';
        
        db.query(updateSql, [token, cliente.id_cliente], (err) => {
            if (err) {
                console.error('❌ Error actualizando token:', err);
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Error al generar el token de recuperación' });
                }
                return;
            }
            
            console.log('✅ Token guardado exitosamente');

            // URL base del frontend
            const emailPort = process.env.FRONTEND_URL || 'http://localhost:4200';
            const resetUrl = `${emailPort}/reset-password?id=${cliente.id_cliente}&token=${token}`;

            // Verificar si las credenciales de email están configuradas
            console.log('Verificando credenciales de email...');
            console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'NO configurado');
            console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Configurado' : 'NO configurado');
            
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                console.error('Credenciales de email no configuradas');
                console.error('EMAIL_USER existe:', !!process.env.EMAIL_USER);
                console.error('EMAIL_PASSWORD existe:', !!process.env.EMAIL_PASSWORD);
                if (!res.headersSent) {
                    return res.status(500).json({ 
                        error: 'El servicio de recuperación de contraseña no está configurado. Por favor, contacta al administrador.' 
                    });
                }
                return;
            }

            // Configurar el transportador de nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                // Aumentar timeout para conexiones lentas
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000
            });

            // Configurar el email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: correo,
                subject: 'Recuperación de contraseña - Imagutoys',
                text: `Hola ${cliente.nombre},\n\nHas solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:\n\n${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste este cambio, ignora este correo.\n\nSaludos,\nEquipo Imagutoys`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Recuperación de contraseña</h2>
                        <p>Hola <strong>${cliente.nombre}</strong>,</p>
                        <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente botón para crear una nueva contraseña:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
                        </div>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                        <p style="color: #999; font-size: 12px;">Este enlace expirará en 1 hora.</p>
                        <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">Saludos,<br>Equipo Imagutoys</p>
                    </div>
                `
            };

            // Responder inmediatamente al cliente y enviar email en segundo plano
            console.log('📤 Enviando respuesta inmediata al cliente...');
            if (!res.headersSent) {
                res.status(200).json({ 
                    message: 'Si el correo existe, se enviará un enlace para restablecer la contraseña' 
                });
                console.log('✅ Respuesta enviada al cliente exitosamente');
            } else {
                console.log('⚠️ Respuesta ya fue enviada, no se puede enviar de nuevo');
            }

            // Enviar el email de forma asíncrona (sin bloquear la respuesta)
            console.log('📧 Intentando enviar email a:', correo);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('❌ Error detallado enviando email:', error);
                    console.error('Código de error:', error.code);
                    console.error('Comando:', error.command);
                    console.error('Respuesta:', error.response);
                    
                    // Log del error pero no afecta la respuesta al cliente
                    if (error.code === 'EAUTH') {
                        console.error('⚠️ Error de autenticación. Verifica que la contraseña de aplicación sea correcta.');
                    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
                        console.error('⚠️ Error de conexión con el servidor de correo.');
                    }
                } else {
                    console.log('✅ Email enviado exitosamente a:', correo);
                    console.log('ID del mensaje:', info.messageId);
                }
            });
        });
    });
};
