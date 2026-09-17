const fs = require('fs');
const path = require('path');
const { createPool } = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'smarthome_supermarket';
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

function quoteIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores.');
  }

  return `\`${value}\``;
}

let pool;

async function initializeDatabase() {
  const bootstrapPool = createPool({
    ...DB_CONFIG,
    database: undefined,
    connectionLimit: 1,
    multipleStatements: true,
  });

  try {
    await bootstrapPool.query(
      `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrapPool.end();
  }

  const schemaPool = createPool({
    ...DB_CONFIG,
    database: undefined,
    connectionLimit: 1,
  });
  const schemaConnection = await schemaPool.getConnection();

  try {
    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await schemaConnection.query(statement);
    }
  } finally {
    schemaConnection.release();
    await schemaPool.end();
  }

  pool = createPool({
    ...DB_CONFIG,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
  });

  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database has not been initialized.');
  }

  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  closePool,
  getPool,
  initializeDatabase,
};
