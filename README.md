# Operational Engine - Simplified Setup 🚀

An **easy-to-use** operational management system for Indonesian SMEs (Small & Medium Enterprises).

## Features ✨

✅ **Dashboard** - View statistics and recent orders at a glance  
✅ **Product Management** - Add, edit, delete products with prices and stock  
✅ **Order Management** - Create and track customer orders  
✅ **Local Database** - SQLite (no PostgreSQL setup needed!)  
✅ **Beautiful UI** - Modern, responsive design  
✅ **Easy Setup** - No Docker required!  

## Prerequisites 📋

Before you start, make sure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

## Installation & Setup 🔧

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `express` - Web server
- `sqlite3` - Database
- `cors` - Enable cross-origin requests
- `body-parser` - Parse request bodies

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
✓ Operational Engine (Simplified)
✓ Server running on http://localhost:5000
✓ Open your browser and visit the link above
```

### Step 3: Open in Browser

Go to: **`http://localhost:5000`**

That's it! The website is ready to use! 🎉

## For Development (with Auto-Restart)

If you want the server to restart automatically when you make changes:

```bash
npm run dev
```

## Project Structure 📁

```
operational-engine-simplified/
├── server.js              # Main server file (Node.js Express)
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Styling
│   └── script.js          # Frontend JavaScript
├── data/
│   └── database.db        # SQLite database (auto-created)
└── README.md              # This file
```

## How to Use 💡

### Dashboard
- See total products, orders, and revenue
- View recent orders

### Products
- Click "+ Add Product" to add new items
- Fill in product name, category, price, and quantity
- Edit or delete products using buttons

### Orders
- Click "+ Create Order" to create a new order
- Select product, enter customer name and quantity
- Change order status: Pending → Completed → Cancelled
- Track all orders in the table

## API Endpoints 🔌

If you want to use the API directly:

```
# Dashboard
GET /api/dashboard

# Products
GET /api/products
POST /api/products
DELETE /api/products/:id

# Orders
GET /api/orders
POST /api/orders
PUT /api/orders/:id (update status)
```

## Database 💾

The SQLite database is automatically created at:
```
./data/database.db
```

No setup needed! The tables are created automatically when the server starts.

## Troubleshooting 🐛

### Port 5000 is already in use

Change the port:
```bash
PORT=3000 npm start
```

Then visit: `http://localhost:3000`

### Database errors

Delete the `data/database.db` file and restart the server:
```bash
rm data/database.db
npm start
```

## Future Enhancements 🚀

- User authentication & login
- Multiple user accounts
- Reports & analytics
- Export to PDF/Excel
- Mobile app
- Cloud backup

## Support & Issues 💬

Have questions? Open an issue on GitHub!

## License 📄

MIT License - Feel free to use and modify!

---

**Made with ❤️ for Indonesian SMEs**
