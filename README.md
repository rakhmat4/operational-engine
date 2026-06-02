# Operational Engine - Ultimate v2.0 🚀

A **professional-grade operational management system** for Indonesian SMEs with advanced analytics, inventory tracking, profit analysis, and multi-category support.

## ✨ Features

### Authentication & Security 🔐
- ✅ User login with username & password
- ✅ JWT token-based authentication
- ✅ Secure session management
- ✅ Default admin account (admin / admin123)

### Dashboard & Analytics 📊
- ✅ Real-time statistics (Revenue, Profit, Orders, Products)
- ✅ Revenue trends chart (last 30 days)
- ✅ Category performance breakdown
- ✅ Low stock alerts
- ✅ Recent orders overview

### Advanced Analytics 📈
- ✅ Top 10 best-selling products
- ✅ Profit margin analysis per product
- ✅ Top customers by spending
- ✅ Category performance metrics
- ✅ Revenue trend analysis

### Product Management 📦
- ✅ Multi-category product organization
- ✅ Cost & selling price tracking
- ✅ Automatic profit margin calculation
- ✅ Stock level management
- ✅ Minimum stock alerts
- ✅ Search & filter products
- ✅ Quick add/edit/delete products

### Order Management 🛒
- ✅ Create orders with customer tracking
- ✅ Automatic inventory deduction
- ✅ Discount calculations
- ✅ Order status tracking (Pending, Completed, Cancelled)
- ✅ Real-time profit calculations per order
- ✅ Complete order history

### Category Management 🏷️
- ✅ Organize products by multiple categories
- ✅ Category performance analytics
- ✅ Easy category creation & management

### Business Intelligence 💼
- ✅ Profit margin tracking
- ✅ Revenue trends
- ✅ Inventory levels
- ✅ Customer insights
- ✅ Best-selling items identification

## 📋 Prerequisites

Before starting, install:
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

Installs:
- `express` - Web server
- `sqlite3` - Database
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Enable cross-origin requests

### Step 2: Start the Server

```bash
npm start
```

You'll see:
```
========================================
✓ Operational Engine (Ultimate v2.0)
✓ Server running on http://localhost:5000
✓ Default login: admin / admin123
========================================
```

### Step 3: Open in Browser

Go to: **`http://localhost:5000`**

### For Development (with auto-restart)

```bash
npm run dev
```

## 🎯 Default Login

**Username:** admin  
**Password:** admin123

⚠️ **Change this in production!**

## 📁 Project Structure

```
operational-engine/
├── server.js              # Node.js backend
├── package.json           # Dependencies
├── public/
│   ├── index.html        # Main dashboard
│   ├── styles.css        # Styling
│   ├── script.js         # Frontend logic
│   └── auth.js           # Authentication
├── data/
│   └── database.db       # SQLite database (auto-created)
└── README.md
```

## 🎮 How to Use

### Dashboard
1. View all key metrics (Revenue, Profit, Orders, Products)
2. Check low stock alerts
3. See recent orders
4. View sales & category performance charts

### Products
1. Click "+ Add Product"
2. Select category, set cost & selling price
3. Enter stock quantity and minimum stock alert level
4. System automatically calculates profit margin
5. Search and filter products by category

### Orders
1. Click "+ Create Order"
2. Enter customer name & phone
3. Select product (auto-shows price)
4. Enter quantity and optional discount
5. See real-time order total calculation
6. Track order status (Pending → Completed → Cancelled)

### Analytics
1. **Best Sellers** - See which products sell most
2. **Profit Analysis** - Track profit margins & total profit per product
3. **Top Customers** - Identify your best customers by spending
4. **Category Performance** - Compare revenue by category
5. **Revenue Trends** - See sales patterns over time

### Categories
1. Organize products into multiple categories
2. View category performance metrics
3. Track revenue per category

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login        # Login
POST   /api/auth/register     # Register new user
```

### Dashboard
```
GET    /api/dashboard         # All statistics
GET    /api/dashboard/alerts  # Low stock alerts
```

### Analytics
```
GET    /api/analytics/best-sellers        # Top products
GET    /api/analytics/profit              # Profit analysis
GET    /api/analytics/revenue-trends      # Revenue over time
GET    /api/analytics/customer-insights   # Customer data
GET    /api/analytics/category-performance # Category metrics
```

### Products
```
GET    /api/products          # All products (with search/filter)
POST   /api/products          # Add product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Orders
```
GET    /api/orders            # All orders
POST   /api/orders            # Create order
PUT    /api/orders/:id        # Update order status
```

### Categories
```
GET    /api/categories        # All categories
POST   /api/categories        # Add category
```

## 🔧 Database

SQLite database auto-created at: `./data/database.db`

**Tables:**
- `users` - User accounts
- `categories` - Product categories
- `products` - Products with cost/selling prices
- `orders` - Customer orders
- `customers` - Customer information

## 🎨 Features Highlights

### Profit Tracking
- Cost price vs Selling price per product
- Automatic margin calculation: `(Selling - Cost) / Selling * 100`
- Total profit per order
- Profit analytics dashboard

### Inventory Management
- Real-time stock tracking
- Automatic deduction on order
- Low stock alerts
- Minimum stock settings per product

### Customer Insights
- Top customers by spending
- Purchase history
- Total orders per customer
- Average order value

### Multi-Category Support
- Unlimited categories
- Category performance metrics
- Revenue breakdown by category
- Filter products by category

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
PORT=3000 npm start
# Then visit: http://localhost:3000
```

### Database errors
```bash
rm data/database.db
npm start  # Will recreate database
```

### Authentication errors
Clear localStorage:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete items with keys: `authToken`, `currentUser`
4. Refresh page

## 📦 Production Deployment

### Important Security Steps:

1. **Change JWT Secret:**
   ```bash
   export JWT_SECRET='your_secure_random_string'
   ```

2. **Change Admin Password:**
   - Edit server.js line ~75 to use a new password hash

3. **Use Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=secure_key
   ```

4. **Database Backup:**
   - Regularly backup `data/database.db`

## 🚀 Future Enhancements

- [ ] Export to PDF/Excel
- [ ] Email notifications
- [ ] Mobile app
- [ ] Cloud backup
- [ ] Multi-branch support
- [ ] User roles & permissions
- [ ] Advanced reporting
- [ ] Payment integration

## 📞 Support

Have questions? Check the documentation or open an issue!

## 📄 License

MIT License - Free to use and modify!

---

**Made with ❤️ for Indonesian SMEs**  
**Version:** 2.0.0 (Ultimate)  
**Last Updated:** 2024
