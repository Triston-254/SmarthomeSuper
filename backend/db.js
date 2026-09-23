const { Pool } = require('pg');

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
let pool;

async function initializeDatabase() {
  if (!DATABASE_URL) {
    throw new Error('SUPABASE_DB_URL is not configured.');
  }

  pool = new Pool({ connectionString: DATABASE_URL, max: 10, ssl: { rejectUnauthorized: false } });
  const schema = `
    CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'staff', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, sku VARCHAR(100) UNIQUE NOT NULL, category VARCHAR(100) NOT NULL, price NUMERIC(10,2) NOT NULL, stock INTEGER NOT NULL DEFAULT 0, capacity INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS sales (id BIGSERIAL PRIMARY KEY, ticket VARCHAR(60) UNIQUE NOT NULL, buyer VARCHAR(255) NOT NULL, server_name VARCHAR(100) NOT NULL, total NUMERIC(10,2) NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, sold_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS sale_items (id BIGSERIAL PRIMARY KEY, sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, product_name VARCHAR(255) NOT NULL, sku VARCHAR(100) NOT NULL, unit_price NUMERIC(10,2) NOT NULL, quantity INTEGER NOT NULL, subtotal NUMERIC(10,2) NOT NULL);
  `;
  await pool.query(schema);
  await pool.query('SELECT 1');
  return pool;
}

function getPool() {
  if (!pool) throw new Error('Database has not been initialized.');
  return pool;
}

async function closePool() {
  if (pool) { await pool.end(); pool = undefined; }
}

module.exports = { closePool, getPool, initializeDatabase };
