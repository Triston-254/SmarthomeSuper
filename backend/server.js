const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { closePool, getPool, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smarthome-supermarket-secret';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'build')));

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createProductSku() {
  return `AUTO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function normalizeEmail(value) {
  return cleanString(value).toLowerCase();
}

function toNumber(value) {
  return Number(value);
}

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function serializeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
}

function serializeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    capacity: Number(row.capacity),
  };
}

async function getProduct(productId) {
  const { rows } = await getPool().query(
    'SELECT id, name, sku, category, price, stock, capacity FROM products WHERE id = $1',
    [productId]
  );
  return rows[0] ? serializeProduct(rows[0]) : null;
}

function makeTicketNumber() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TKT-${Date.now()}-${random}`;
}

function serializeSale(row, items = []) {
  return {
    id: row.id,
    ticket: row.ticket,
    buyer: row.buyer,
    server: row.server_name,
    total: Number(row.total),
    user_id: row.user_id,
    timestamp: new Date(row.sold_at).toISOString(),
    items: items.map((item) => ({
      id: item.product_id,
      product_id: item.product_id,
      name: item.product_name,
      sku: item.sku,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
    })),
  };
}

app.get('/api/health', async (req, res, next) => {
  try {
    await getPool().query('SELECT 1 AS ok');
    res.json({ status: 'ok', service: 'supermarket-backend' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/signup', async (req, res, next) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const name = cleanString(payload.name);
    const email = normalizeEmail(payload.email);
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    }

    const existing = await getPool().query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await getPool().query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, \'staff\') RETURNING id, name, email, role',
      [name, email, passwordHash]
    );
    const user = rows[0];

    return res.status(201).json({ token: createToken(user), user });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const email = normalizeEmail(payload.email);
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await getPool().query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email]);
    const userRow = rows[0];

    if (!userRow || !(await bcrypt.compare(password, userRow.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = serializeUser(userRow);
    return res.json({ token: createToken(user), user });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/me', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await getPool().query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    const userRow = rows[0];

    if (!userRow) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    return res.json({ user: serializeUser(userRow) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/products', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await getPool().query('SELECT id, name, sku, category, price, stock, capacity FROM products ORDER BY id ASC');
    return res.json(rows.map(serializeProduct));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/products', authMiddleware, async (req, res, next) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const name = cleanString(payload.name);
    const requestedSku = cleanString(payload.sku);
    const sku = requestedSku || createProductSku();
    const category = cleanString(payload.category);
    const price = toNumber(payload.price);
    const stock = toNumber(payload.stock);
    const capacity = toNumber(payload.capacity);

    if (!name || !category || !isNonNegativeNumber(price) || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(capacity) || capacity <= 0) {
      return res.status(400).json({ message: 'Name, category, price, stock and capacity are required.' });
    }

    const { rows } = await getPool().query(
      'INSERT INTO products (name, sku, category, price, stock, capacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, sku, category, price, stock, capacity]
    );
    const product = await getProduct(rows[0].id);

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const current = await getProduct(productId);
    if (!current) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const updates = [];
    const values = [];
    const allowedFields = ['name', 'sku', 'category', 'price', 'stock', 'capacity'];

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(payload, field)) {
        continue;
      }

      if (field === 'name' || field === 'sku' || field === 'category') {
        const value = cleanString(payload[field]);
        if (!value) {
          return res.status(400).json({ message: 'Product fields cannot be empty.' });
        }
        values.push(value);
        updates.push(`${field} = $${values.length}`);
        continue;
      }

      const value = toNumber(payload[field]);
      if (!Number.isFinite(value)) {
        return res.status(400).json({ message: 'Product quantities and price must be numbers.' });
      }

      if (field === 'price' && value < 0) {
        return res.status(400).json({ message: 'Price cannot be negative.' });
      }

      if ((field === 'stock' || field === 'capacity') && (!Number.isInteger(value) || value < 0)) {
        return res.status(400).json({ message: 'Stock and capacity must be whole numbers.' });
      }

      values.push(value);
      updates.push(`${field} = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.json(current);
    }

    values.push(productId);
    await getPool().query(`UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`, values);

    return res.json(await getProduct(productId));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/sales', authMiddleware, async (req, res, next) => {
  const connection = await getPool().connect();

  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const buyer = cleanString(payload.buyer) || 'Walk-in Customer';
    const server = cleanString(payload.server) || 'Manager';
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    const items = rawItems.map((item) => ({
      id: Number(item?.id),
      name: cleanString(item?.name),
      sku: cleanString(item?.sku),
      price: toNumber(item?.price),
      quantity: Number(item?.quantity),
    }));

    if (items.length === 0 || items.some((item) => (
      !Number.isInteger(item.id)
      || item.id <= 0
      || !item.name
      || !item.sku
      || !isNonNegativeNumber(item.price)
      || !Number.isInteger(item.quantity)
      || item.quantity <= 0
    ))) {
      return res.status(400).json({ message: 'Sale items are invalid.' });
    }

    const total = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    const soldAt = new Date();
    const ticket = makeTicketNumber();

    await connection.query('BEGIN');
    for (const item of items) {
      const productResult = await connection.query('SELECT id, stock FROM products WHERE id = $1 FOR UPDATE', [item.id]);
      const product = productResult.rows[0];
      if (!product) {
        const error = new Error('One or more products were not found.');
        error.status = 404;
        throw error;
      }
      if (Number(product.stock) < item.quantity) {
        const error = new Error(`Only ${product.stock} units are available for one or more products.`);
        error.status = 409;
        throw error;
      }
      await connection.query('UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2', [item.quantity, item.id]);
    }

    const saleResult = await connection.query(
      'INSERT INTO sales (ticket, buyer, server_name, total, user_id, sold_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, ticket, buyer, server_name, total, user_id, sold_at',
      [ticket, buyer, server, total, req.user.id, soldAt]
    );
    const saleRow = saleResult.rows[0];
    for (const item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, product_name, sku, unit_price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [saleRow.id, item.id, item.name, item.sku, item.price, item.quantity, Number((item.price * item.quantity).toFixed(2))]
      );
    }
    await connection.query('COMMIT');
    const itemResult = await connection.query('SELECT product_id, product_name, sku, unit_price, quantity, subtotal FROM sale_items WHERE sale_id = $1 ORDER BY id ASC', [saleRow.id]);
    const sale = serializeSale(saleRow, itemResult.rows);

    /*
      for (const item of items) {
        const product = await products.findOne({ id: item.id }, { session });
        if (!product) {
          const error = new Error('One or more products were not found.');
          error.status = 404;
          throw error;
        }

        if (Number(product.stock) < item.quantity) {
          const error = new Error(`Only ${product.stock} units are available for one or more products.`);
          error.status = 409;
          throw error;
        }

        await products.updateOne(
          { id: item.id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity }, $set: { updated_at: new Date() } },
          { session }
        );
      }

      const saleDocument = {
        id: await nextId('sales'),
        ticket,
        buyer,
        server_name: server,
        total,
        user_id: req.user.id,
        sold_at: soldAt,
        created_at: new Date(),
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          sku: item.sku,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: Number((item.price * item.quantity).toFixed(2)),
        })),
      };
      await sales.insertOne(saleDocument, { session });
      sale = serializeSale(saleDocument, saleDocument.items);
    }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } }); */

    return res.status(201).json(sale);
  } catch (error) {
    await connection.query('ROLLBACK');
    return next(error);
  } finally {
    connection.release();
  }
});

app.get('/api/sales', authMiddleware, async (req, res, next) => {
  try {
    const { rows: saleRows } = await getPool().query(
      'SELECT id, ticket, buyer, server_name, total, user_id, sold_at FROM sales ORDER BY sold_at DESC LIMIT 100'
    );
    const sales = await Promise.all(saleRows.map(async (saleRow) => {
      const { rows: itemRows } = await getPool().query(
        'SELECT product_id, product_name, sku, unit_price, quantity, subtotal FROM sale_items WHERE sale_id = $1 ORDER BY id ASC',
        [saleRow.id]
      );
      return serializeSale(saleRow, itemRows);
    }));

    return res.json(sales);
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  res.status(404).json({ message: 'Endpoint not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error.code === 'ER_DUP_ENTRY' || error.code === 11000) {
    return res.status(409).json({ message: 'A record with those details already exists.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

let databaseReady;

async function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = initializeDatabase().catch((error) => {
      databaseReady = undefined;
      throw error;
    });
  }

  return databaseReady;
}

async function handler(req, res) {
  try {
    await ensureDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Database is unavailable. Please try again.' });
    }
  }
}

async function start() {
  await ensureDatabase();
  app.listen(PORT, () => {
    console.log(`SmartHome supermarket backend running on port ${PORT}`);
  });
}

async function shutdown() {
  await closePool();
  process.exit(0);
}

if (require.main === module) {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch(async (error) => {
    console.error('Unable to start the backend:', error.message);
    await closePool();
    process.exit(1);
  });
}

module.exports = handler;
