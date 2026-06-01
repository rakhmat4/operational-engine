const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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
    // Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        price REAL,
        quantity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        product_id INTEGER,
        quantity INTEGER,
        total_price REAL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Dashboard Stats (Summary)
    db.run(`
      CREATE TABLE IF NOT EXISTS dashboard_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_products INTEGER,
        total_orders INTEGER,
        total_revenue REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

// API Routes

// Get Dashboard Data
app.get('/api/dashboard', (req, res) => {
  db.all(`
    SELECT 
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_price), 0) as total_revenue
    FROM products p
    LEFT JOIN orders o ON 1=1
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows[0]);
    }
  });
});

// Get All Products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add New Product
app.post('/api/products', (req, res) => {
  const { name, category, price, quantity } = req.body;
  db.run(
    'INSERT INTO products (name, category, price, quantity) VALUES (?, ?, ?, ?)',
    [name, category, price, quantity],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, category, price, quantity });
      }
    }
  );
});

// Get All Orders
app.get('/api/orders', (req, res) => {
  db.all(`
    SELECT o.*, p.name as product_name 
    FROM orders o 
    LEFT JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add New Order
app.post('/api/orders', (req, res) => {
  const { customer_name, product_id, quantity, total_price } = req.body;
  db.run(
    'INSERT INTO orders (customer_name, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
    [customer_name, product_id, quantity, total_price, 'pending'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, customer_name, product_id, quantity, total_price, status: 'pending' });
      }
    }
  );
});

// Update Order Status
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Order updated successfully' });
      }
    }
  );
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('✓ Operational Engine (Simplified)');
  console.log('✓ Server running on http://localhost:' + PORT);
  console.log('✓ Open your browser and visit the link above');
  console.log('========================================\n');
});
