import db from '../config/bd.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// dotenv ya se carga en servidor.js, no es necesario cargarlo aquí

export const forgotPassword = (req, res) => {
    console.log('Peticion recibida para recuperacion de contrasena');
    console.log('Body recibido:', JSON.stringify(req.body));
    const { correo } = req.body;
    console.log('Correo recibido:', correo);

    if (!correo) {
        console.log('Error: Correo no proporcionado');
        return res.status(400).json({ error: 'El correo es requerido' });
    }

    const sql = 'SELECT id_cliente, nombre, correo FROM cliente WHERE correo = ? LIMIT 1';
    
    const queryTimeout = setTimeout(() => {
        console.error('Timeout en consulta a base de datos');
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Timeout en consulta a base de datos' });
        }
    }, 5000);
    
    db.query(sql, [correo], (err, results) => {
        clearTimeout(queryTimeout);
        
        if (err) {
            console.error('Error consultando cliente:', err);
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            return;
        }

        console.log('Resultados de busqueda:', results ? results.length : 0, 'registros encontrados');

        if (!results || results.length === 0) {
            console.log('Correo no encontrado en la base de datos:', correo);
            if (!res.headersSent) {
                return res.status(200).json({ 
                    message: 'Si el correo existe, se enviara un enlace para restablecer la contrasena',
                    correoNoEncontrado: true
                });
            }
            return;
        }
        
        console.log('Cliente encontrado:', results[0].nombre);

        const cliente = results[0];

        const token = jwt.sign(
            { id_cliente: cliente.id_cliente },
            process.env.JWT_SECRET || 'tu_secret_key_muy_segura',
            { expiresIn: '1h' }
        );

        const updateSql = 'UPDATE cliente SET resetPasswordToken = ?, resetPasswordExpires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id_cliente = ?';
        
        db.query(updateSql, [token, cliente.id_cliente], (err) => {
            if (err) {
                console.error('Error actualizando token:', err);
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Error al generar el token de recuperacion' });
                }
                return;
            }
            
            console.log('Token guardado exitosamente');

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
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000
            });

            // Configurar el email con diseño similar a la web
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: correo,
                subject: 'Recuperacion de contrasena - Imagu Toys',
                text: `Hola ${cliente.nombre},\n\nHas solicitado restablecer tu contrasena. Por favor, haz clic en el siguiente enlace para crear una nueva contrasena:\n\n${resetUrl}\n\nEste enlace expirara en 1 hora.\n\nSi no solicitaste este cambio, ignora este correo.\n\nSaludos,\nEquipo Imagu Toys`,
                html: `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 32px; text-align: center; border-bottom: 1px solid #1d4ed8;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Imagu Toys</h1>
                            </div>
                            <div style="padding: 40px 32px;">
                                <h2 style="color: #111827; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">Recuperacion de Contrasena</h2>
                                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Hola <strong style="color: #111827;">${cliente.nombre}</strong>,</p>
                                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">Has solicitado restablecer tu contrasena. Por favor, haz clic en el siguiente boton para crear una nueva contrasena:</p>
                                
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">Restablecer Contrasena</a>
                                </div>

                                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                                    <p style="color: #d97706; font-size: 14px; font-weight: 500; margin: 0; line-height: 1.5;">
                                        <strong>Importante:</strong> Este enlace expirara en 1 hora. Si no solicitaste este cambio, ignora este correo.
                                    </p>
                                </div>

                                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                                        Saludos,<br>
                                        <strong style="color: #111827;">Equipo Imagu Toys</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            console.log('Enviando respuesta inmediata al cliente...');
            if (!res.headersSent) {
                res.status(200).json({ 
                    message: 'Si el correo existe, se enviara un enlace para restablecer la contrasena' 
                });
                console.log('Respuesta enviada al cliente exitosamente');
            } else {
                console.log('Respuesta ya fue enviada, no se puede enviar de nuevo');
            }

            console.log('Intentando enviar email a:', correo);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error detallado enviando email:', error);
                    console.error('Codigo de error:', error.code);
                    console.error('Comando:', error.command);
                    console.error('Respuesta:', error.response);
                    
                    if (error.code === 'EAUTH') {
                        console.error('Error de autenticacion. Verifica que la contrasena de aplicacion sea correcta.');
                    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
                        console.error('Error de conexion con el servidor de correo.');
                    }
                } else {
                    console.log('Email enviado exitosamente a:', correo);
                    console.log('ID del mensaje:', info.messageId);
                }
            });
        });
    });
};
