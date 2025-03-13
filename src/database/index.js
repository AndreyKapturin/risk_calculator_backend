import mysql from 'mysql2/promise';

let connection;

try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
  });
} catch (error) {
  console.log('DB connection error', error)
  throw error;
}

export { connection };