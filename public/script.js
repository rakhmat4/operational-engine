const API_URL = 'http://localhost:5000/api';
let allProducts = [];
let allOrders = [];

// Page Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const titles = {
            dashboard: '📊 Dashboard',
            analytics: '📈 Analytics',
            products: '📦 Products',
            orders: '🛒 Orders',
            categories: '🏷️ Categories'
        };
        document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    });
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    if (page === 'dashboard') { loadDashboard(); loadAlerts(); }
    if (page === 'analytics') loadAnalytics();
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
    if (page === 'categories') loadCategories();
}

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value || 0);
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`, { headers: getAuthHeader() });
        const data = await response.json();
        
        document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue);
        document.getElementById('total-profit').textContent = formatCurrency(data.total_profit);
        document.getElementById('total-orders').textContent = data.total_orders;
        document.getElementById('total-products').textContent = data.total_products;
        document.getElementById('total-customers').textContent = data.total_customers;
        
        loadRecentOrders();
        loadCharts();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadAlerts() {
    try {
        const response = await fetch(`${API_URL}/dashboard/alerts`, { headers: getAuthHeader() });
        const alerts = await response.json();
        
        let html = '';
        alerts.forEach(alert => {
            html += `
                <div class="alert">
                    <strong>⚠️ Low Stock:</strong> ${alert.name} - Only ${alert.quantity} left (Min: ${alert.min_stock})
                </div>
            `;
        });
        
        document.getElementById('alerts-container').innerHTML = html;
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, { headers: getAuthHeader() });
        const orders = await response.json();
        const recentOrders = orders.slice(0, 5);
        
        let html = '';
        recentOrders.forEach(order => {
            html += `
                <div class="order-item">
                    <div class="order-info">
                        <strong>${order.customer_name}</strong>
                        <p>${order.product_name || 'Product'} × ${order.quantity}</p>
                        <p style="font-size: 12px; color: #999;">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                        <div style="text-align: right; margin-top: 8px; font-weight: bold; color: #667eea;">${formatCurrency(order.total_price)}</div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('recent-orders').innerHTML = html || '<p style="text-align: center; color: #999;">No orders yet</p>';
    } catch (error) {
        console.error('Error loading recent orders:', error);
    }
}

async function loadCharts() {
    try {
        // Revenue Trends
        const trendsResponse = await fetch(`${API_URL}/analytics/revenue-trends`, { headers: getAuthHeader() });
        const trends = await trendsResponse.json();
        
        const revenueCtx = document.getElementById('revenue-chart');
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: trends.map(t => t.date).reverse(),
                    datasets: [{
                        label: 'Revenue',
                        data: trends.map(t => t.revenue).reverse(),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true }
            });
        }
        
        // Category Performance
        const categoryResponse = await fetch(`${API_URL}/analytics/category-performance`, { headers: getAuthHeader() });
        const categories = await categoryResponse.json();
        
        const categoryCtx = document.getElementById('category-chart');
        if (categoryCtx) {
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: categories.map(c => c.category || 'Uncategorized'),
                    datasets: [{
                        data: categories.map(c => c.total_revenue || 0),
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true }
            });
        }
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

// ==================== ANALYTICS ====================
async function loadAnalytics() {
    loadBestSellers();
    loadProfitAnalysis();
    loadTopCustomers();
}

async function loadBestSellers() {
    try {
        const response = await fetch(`${API_URL}/analytics/best-sellers`, { headers: getAuthHeader() });
        const sellers = await response.json();
        
        let html = '';
        sellers.forEach(seller => {
            html += `
                <div class="analytics-item">
                    <div class="analytics-item-name">${seller.name || 'Unknown'}</div>
                    <div class="analytics-item-value">${seller.total_sold} orders</div>
                </div>
            `;
        });
        
        document.getElementById('best-sellers').innerHTML = html || '<p style="text-align: center; color: #999;">No data</p>';
    } catch (error) {
        console.error('Error loading best sellers:', error);
    }
}

async function loadProfitAnalysis() {
    try {
        const response = await fetch(`${API_URL}/analytics/profit`, { headers: getAuthHeader() });
        const profits = await response.json();
        
        let html = '';
        profits.forEach(profit => {
            html += `
                <div class="analytics-item">
                    <div>
                        <div class="analytics-item-name">${profit.name}</div>
                        <small style="color: #999;">Margin: ${profit.profit_margin}%</small>
                    </div>
                    <div class="analytics-item-value">${formatCurrency(profit.total_profit)}</div>
                </div>
            `;
        });
        
        document.getElementById('profit-analysis').innerHTML = html || '<p style="text-align: center; color: #999;">No data</p>';
    } catch (error) {
        console.error('Error loading profit analysis:', error);
    }
}

async function loadTopCustomers() {
    try {
        const response = await fetch(`${API_URL}/analytics/customer-insights`, { headers: getAuthHeader() });
        const customers = await response.json();
        
        let html = '';
        customers.forEach(customer => {
            html += `
                <div class="analytics-item">
                    <div>
                        <div class="analytics-item-name">${customer.customer_name}</div>
                        <small style="color: #999;">${customer.total_orders} orders</small>
                    </div>
                    <div class="analytics-item-value">${formatCurrency(customer.total_spent)}</div>
                </div>
            `;
        });
        
        document.getElementById('top-customers').innerHTML = html || '<p style="text-align: center; color: #999;">No data</p>';
    } catch (error) {
        console.error('Error loading top customers:', error);
    }
}

// ==================== CATEGORIES ====================
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, { headers: getAuthHeader() });
        const categories = await response.json();
        
        let html = '';
        categories.forEach(cat => {
            html += `
                <div class="category-card">
                    <h3>🏷️ ${cat.name}</h3>
                    <p>${cat.description || 'No description'}</p>
                </div>
            `;
        });
        
        document.getElementById('categories-list').innerHTML = html || '<p>No categories</p>';
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

document.getElementById('add-category-btn').addEventListener('click', () => {
    document.getElementById('add-category-form').classList.remove('hidden');
});

document.getElementById('cancel-category-btn').addEventListener('click', () => {
    document.getElementById('add-category-form').classList.add('hidden');
});

document.querySelector('#add-category-form .form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-desc').value
    };
    
    try {
        await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(category)
        });
        
        document.getElementById('add-category-form').classList.add('hidden');
        document.querySelector('#add-category-form .form').reset();
        loadCategories();
        loadProductCategories();
        alert('✓ Category added successfully!');
    } catch (error) {
        alert('✗ Error adding category');
    }
});

// ==================== PRODUCTS ====================
async function loadProducts() {
    try {
        const search = document.getElementById('product-search')?.value || '';
        const category = document.getElementById('category-filter')?.value || '';
        const response = await fetch(`${API_URL}/products?search=${search}&category=${category}`, { headers: getAuthHeader() });
        const products = await response.json();
        allProducts = products;
        
        let html = '';
        products.forEach(product => {
            html += `
                <div class="product-card">
                    <h3>📦 ${product.name}</h3>
                    <div class="product-info">Category: ${product.category_name || 'N/A'}</div>
                    <div class="product-prices">
                        <div class="product-price-item">
                            <small>Cost</small>
                            <strong>${formatCurrency(product.cost_price)}</strong>
                        </div>
                        <div class="product-price-item">
                            <small>Selling</small>
                            <strong>${formatCurrency(product.selling_price)}</strong>
                        </div>
                    </div>
                    <div class="product-margin">Profit Margin: ${product.profit_margin}%</div>
                    <div class="product-info">Stock: <strong>${product.quantity}</strong> (Min: ${product.min_stock})</div>
                    <div class="product-actions">
                        <button class="btn btn-warning" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('products-list').innerHTML = html || '<p>No products</p>';
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadProductCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, { headers: getAuthHeader() });
        const categories = await response.json();
        
        let html = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            html += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        document.getElementById('product-category').innerHTML = html;
        document.getElementById('category-filter').innerHTML = '<option value="">All Categories</option>' + html.substring(html.indexOf('<option', 1));
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

document.getElementById('add-product-btn').addEventListener('click', () => {
    loadProductCategories();
    document.getElementById('add-product-form').classList.remove('hidden');
});

document.getElementById('cancel-product-btn').addEventListener('click', () => {
    document.getElementById('add-product-form').classList.add('hidden');
});

document.querySelector('#add-product-form .form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = {
        name: document.getElementById('product-name').value,
        category_id: document.getElementById('product-category').value || null,
        cost_price: parseFloat(document.getElementById('product-cost').value),
        selling_price: parseFloat(document.getElementById('product-selling').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        min_stock: parseInt(document.getElementById('product-min-stock').value)
    };
    
    try {
        await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(product)
        });
        
        document.getElementById('add-product-form').classList.add('hidden');
        document.querySelector('#add-product-form .form').reset();
        loadProducts();
        alert('✓ Product added successfully!');
    } catch (error) {
        alert('✗ Error adding product');
    }
});

async function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            loadProducts();
            alert('✓ Product deleted!');
        } catch (error) {
            alert('✗ Error deleting product');
        }
    }
}

function editProduct(id) {
    alert('Edit feature coming soon!');
}

document.getElementById('product-search').addEventListener('keyup', loadProducts);
document.getElementById('category-filter').addEventListener('change', loadProducts);

// ==================== ORDERS ====================
async function loadOrders() {
    try {
        await loadProductOptions();
        const response = await fetch(`${API_URL}/orders`, { headers: getAuthHeader() });
        const orders = await response.json();
        allOrders = orders;
        
        let html = '';
        orders.forEach(order => {
            html += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.product_name || 'N/A'}</td>
                    <td>${order.quantity}</td>
                    <td>${formatCurrency(order.unit_price)}</td>
                    <td>${formatCurrency(order.total_price - (order.discount || 0))}</td>
                    <td>${order.profit_margin}%</td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td><button class="btn btn-danger" onclick="alert('Delete feature coming soon!')">Delete</button></td>
                </tr>
            `;
        });
        
        document.getElementById('orders-table').innerHTML = html || '<tr><td colspan="10" style="text-align: center; color: #999;">No orders</td></tr>';
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadProductOptions() {
    try {
        const response = await fetch(`${API_URL}/products`, { headers: getAuthHeader() });
        const products = await response.json();
        
        let html = '<option value="">Select Product</option>';
        products.forEach(p => {
            html += `<option value="${p.id}" data-price="${p.selling_price}">${p.name} - ${formatCurrency(p.selling_price)}</option>`;
        });
        
        document.getElementById('order-product').innerHTML = html;
    } catch (error) {
        console.error('Error loading products for order:', error);
    }
}

document.getElementById('order-product').addEventListener('change', calculateOrderTotal);
document.getElementById('order-quantity').addEventListener('input', calculateOrderTotal);
document.getElementById('order-discount').addEventListener('input', calculateOrderTotal);

function calculateOrderTotal() {
    const productSelect = document.getElementById('order-product');
    const quantity = parseInt(document.getElementById('order-quantity').value) || 0;
    const discount = parseInt(document.getElementById('order-discount').value) || 0;
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const unitPrice = parseFloat(selectedOption.dataset.price) || 0;
    const subtotal = unitPrice * quantity;
    const total = subtotal - discount;
    
    document.getElementById('calc-unit-price').textContent = formatCurrency(unitPrice);
    document.getElementById('calc-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('calc-total').textContent = formatCurrency(total);
}

document.getElementById('add-order-btn').addEventListener('click', () => {
    loadProductOptions();
    document.getElementById('add-order-form').classList.remove('hidden');
});

document.getElementById('cancel-order-btn').addEventListener('click', () => {
    document.getElementById('add-order-form').classList.add('hidden');
});

document.querySelector('#add-order-form .form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const order = {
        customer_name: document.getElementById('order-customer').value,
        customer_phone: document.getElementById('order-phone').value,
        product_id: parseInt(document.getElementById('order-product').value),
        quantity: parseInt(document.getElementById('order-quantity').value),
        unit_price: parseFloat(document.querySelector('#order-product option:checked').dataset.price),
        discount: parseInt(document.getElementById('order-discount').value) || 0
    };
    
    try {
        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(order)
        });
        
        document.getElementById('add-order-form').classList.add('hidden');
        document.querySelector('#add-order-form .form').reset();
        loadOrders();
        alert('✓ Order created successfully!');
    } catch (error) {
        alert('✗ Error creating order');
    }
});

async function updateOrderStatus(id, status) {
    try {
        await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status })
        });
        loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

// Initialize
window.addEventListener('load', () => {
    if (authToken) {
        loadDashboard();
        loadProductCategories();
    }
});
