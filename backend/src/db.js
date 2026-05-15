require('dotenv').config(); 
console.log("DB_PASSWORD 👉", process.env.DB_PASSWORD);
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log('PostgreSQL Connected ✅'))
  .catch(err => console.error('Database connection error ❌', err));

module.exports = pool;