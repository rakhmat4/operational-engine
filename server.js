const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_change_in_production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize SQLite Database
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✓ SQLite Database connected');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories Table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        cost_price REAL,
        selling_price REAL,
        quantity INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,
        total_price REAL,
        discount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Customer Table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        total_purchases REAL DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default user if not exists
    db.run(`
      INSERT OR IGNORE INTO users (username, password, email)
      VALUES ('admin', ?, 'admin@operationalengine.com')
    `, [hashPassword('admin123')]);
  });
}

// Helper Functions
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware: Verify JWT Token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// AUTH Routes
app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.run(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, hashPassword(password), email],
    function(err) {
      if (err) {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.json({ message: 'User registered successfully' });
      }
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

// DASHBOARD
app.get('/api/dashboard', verifyToken, (req, res) => {
  db.all(`
    SELECT 
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_price - o.discount), 0) as total_revenue,
      COALESCE(SUM((o.quantity * p.selling_price) - (o.quantity * p.cost_price)), 0) as total_profit,
      COUNT(DISTINCT c.id) as total_customers
    FROM products p
    LEFT JOIN orders o ON 1=1
    LEFT JOIN customers c ON 1=1
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows[0]);
    }
  });
});

// Low Stock Alert
app.get('/api/dashboard/alerts', verifyToken, (req, res) => {
  db.all(`
    SELECT id, name, quantity, min_stock
    FROM products
    WHERE quantity <= min_stock
    ORDER BY quantity ASC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// CATEGORIES
app.get('/api/categories', verifyToken, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name ASC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/categories', verifyToken, (req, res) => {
  const { name, description } = req.body;
  db.run(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
    function(err) {
      if (err) res.status(400).json({ error: 'Category already exists' });
      else res.json({ id: this.lastID, name, description });
    }
  );
});

// PRODUCTS
app.get('/api/products', verifyToken, (req, res) => {
  const search = req.query.search || '';
  const category = req.query.category || '';
  
  let query = `
    SELECT p.*, c.name as category_name,
           ROUND(((p.selling_price - p.cost_price) / p.selling_price * 100), 2) as profit_margin
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  let params = [];
  
  if (search) {
    query += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    query += ' AND p.category_id = ?';
    params.push(category);
  }
  
  query += ' ORDER BY p.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/products', verifyToken, (req, res) => {
  const { name, category_id, cost_price, selling_price, quantity, min_stock } = req.body;
  db.run(
    'INSERT INTO products (name, category_id, cost_price, selling_price, quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category_id, cost_price, selling_price, quantity, min_stock || 10],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, name, category_id, cost_price, selling_price, quantity });
    }
  );
});

app.put('/api/products/:id', verifyToken, (req, res) => {
  const { name, category_id, cost_price, selling_price, quantity, min_stock } = req.body;
  db.run(
    'UPDATE products SET name=?, category_id=?, cost_price=?, selling_price=?, quantity=?, min_stock=? WHERE id=?',
    [name, category_id, cost_price, selling_price, quantity, min_stock, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: 'Product updated' });
    }
  );
});

app.delete('/api/products/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ message: 'Product deleted' });
  });
});

// ORDERS
app.get('/api/orders', verifyToken, (req, res) => {
  db.all(`
    SELECT o.*, p.name as product_name, p.cost_price,
           ROUND(((p.selling_price - p.cost_price) / p.selling_price * 100), 2) as profit_margin
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/orders', verifyToken, (req, res) => {
  const { customer_name, customer_phone, product_id, quantity, unit_price, discount } = req.body;
  const total_price = (quantity * unit_price) - (discount || 0);
  
  db.run('BEGIN TRANSACTION');
  
  // Insert order
  db.run(
    'INSERT INTO orders (customer_name, customer_phone, product_id, quantity, unit_price, total_price, discount) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [customer_name, customer_phone, product_id, quantity, unit_price, total_price, discount || 0],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      // Update product stock
      db.run(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [quantity, product_id],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          db.run('COMMIT');
          res.json({ id: this.lastID, message: 'Order created successfully' });
        }
      );
    }
  );
});

app.put('/api/orders/:id', verifyToken, (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: 'Order updated' });
    }
  );
});

// ANALYTICS
app.get('/api/analytics/best-sellers', verifyToken, (req, res) => {
  db.all(`
    SELECT p.id, p.name, COUNT(o.id) as total_sold, SUM(o.quantity) as total_quantity,
           SUM(o.total_price) as total_revenue
    FROM products p
    LEFT JOIN orders o ON p.id = o.product_id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.get('/api/analytics/profit', verifyToken, (req, res) => {
  db.all(`
    SELECT p.id, p.name, p.cost_price, p.selling_price,
           ROUND(((p.selling_price - p.cost_price) / p.selling_price * 100), 2) as profit_margin,
           SUM(o.quantity) as units_sold,
           ROUND(SUM(o.quantity * (p.selling_price - p.cost_price)), 0) as total_profit
    FROM products p
    LEFT JOIN orders o ON p.id = o.product_id
    GROUP BY p.id
    ORDER BY total_profit DESC
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.get('/api/analytics/revenue-trends', verifyToken, (req, res) => {
  db.all(`
    SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_price) as revenue
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.get('/api/analytics/customer-insights', verifyToken, (req, res) => {
  db.all(`
    SELECT customer_name, COUNT(*) as total_orders, SUM(total_price) as total_spent,
           ROUND(AVG(total_price), 0) as avg_order_value
    FROM orders
    GROUP BY customer_name
    ORDER BY total_spent DESC
    LIMIT 20
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.get('/api/analytics/category-performance', verifyToken, (req, res) => {
  db.all(`
    SELECT c.name as category, COUNT(o.id) as total_orders,
           SUM(o.total_price) as total_revenue,
           ROUND(SUM(o.quantity * (p.selling_price - p.cost_price)), 0) as total_profit
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    LEFT JOIN orders o ON p.id = o.product_id
    GROUP BY c.id
    ORDER BY total_revenue DESC
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('✓ Operational Engine (Ultimate v2.0)');
  console.log('✓ Server running on http://localhost:' + PORT);
  console.log('✓ Default login: admin / admin123');
  console.log('========================================\n');
});
