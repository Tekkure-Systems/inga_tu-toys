import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'imagutoys',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  };

  console.log('Trying DB connection with config:', {
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port,
  });

  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected to MySQL successfully.');

    // Check that the producto table exists and count rows
    try {
      const [countRows] = await conn.query('SELECT COUNT(*) AS cnt FROM producto');
      console.log('producto table row count:', countRows[0].cnt);

      const [sample] = await conn.query('SELECT * FROM producto LIMIT 5');
      console.log('Sample rows (up to 5):', JSON.stringify(sample, null, 2));
    } catch (qErr) {
      console.error('Query error (table may not exist):', qErr.message || qErr);
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message || err);
    if (err && err.code) console.error('Error code:', err.code);
    process.exit(1);
  }
}

main();

