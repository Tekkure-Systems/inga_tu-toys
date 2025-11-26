import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Base de datos no existe, intentando crearla...');
            
            const dbWithoutDB = mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            });
            
            dbWithoutDB.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`, (createErr) => {
                if (createErr) {
                    console.error('Error creando base de datos:', createErr);
                    dbWithoutDB.end();
                    return;
                }
                
                console.log(`Base de datos '${process.env.DB_NAME}' creada exitosamente`);
                dbWithoutDB.end();
                
                db.connect((retryErr) => {
                    if (retryErr) {
                        console.error('Error al conectar a la base de datos despues de crearla:', retryErr);
                        return;
                    }
                    console.log('Conectado a la base de datos:', process.env.DB_NAME);
                });
            });
        } else {
            console.error('Error al conectar a la base de datos:', err);
        }
        return;
    }
    console.log('Conectado a la base de datos:', process.env.DB_NAME);
});

export default db;
