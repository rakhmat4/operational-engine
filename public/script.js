// API Base URL
const API_URL = 'http://localhost:5000/api';

// Page Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            products: 'Products Management',
            orders: 'Orders Management',
            settings: 'Settings'
        };
        document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    });
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    // Refresh data when switching pages
    if (page === 'dashboard') loadDashboard();
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`);
        const data = await response.json();
        
        document.getElementById('total-products').textContent = data.total_products || 0;
        document.getElementById('total-orders').textContent = data.total_orders || 0;
        document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue || 0);
        
        loadRecentOrders();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
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

// Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        let html = '';
        products.forEach(product => {
            html += `
                <div class="product-card">
                    <h3>📦 ${product.name}</h3>
                    <div class="product-info">Category: ${product.category || 'N/A'}</div>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-info">Stock: <strong>${product.quantity}</strong></div>
                    <div class="product-actions">
                        <button class="btn btn-warning" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('products-list').innerHTML = html || '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products yet</p>';
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add Product Button
document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('add-product-form').classList.remove('hidden');
});

document.getElementById('cancel-product-btn').addEventListener('click', () => {
    document.getElementById('add-product-form').classList.add('hidden');
    document.querySelector('.form').reset();
});

// Submit Add Product Form
document.querySelector('#add-product-form .form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value)
    };
    
    try {
        await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        
        document.getElementById('add-product-form').classList.add('hidden');
        document.querySelector('#add-product-form .form').reset();
        loadProducts();
        alert('✓ Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
        alert('✗ Error adding product');
    }
});

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            loadProducts();
            alert('✓ Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}

function editProduct(id) {
    alert('Edit feature coming soon!');
}

// Orders
async function loadOrders() {
    try {
        // Load products for dropdown
        const productsResponse = await fetch(`${API_URL}/products`);
        const products = await productsResponse.json();
        
        let productOptions = '<option value="">Select Product</option>';
        products.forEach(p => {
            productOptions += `<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`;
        });
        document.getElementById('order-product').innerHTML = productOptions;
        
        // Load orders
        const ordersResponse = await fetch(`${API_URL}/orders`);
        const orders = await ordersResponse.json();
        
        let html = '';
        orders.forEach(order => {
            html += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.product_name || 'N/A'}</td>
                    <td>${order.quantity}</td>
                    <td>${formatCurrency(order.total_price)}</td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td><button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button></td>
                </tr>
            `;
        });
        
        document.getElementById('orders-table').innerHTML = html || '<tr><td colspan="8" style="text-align: center; color: #999;">No orders yet</td></tr>';
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Add Order Button
document.getElementById('add-order-btn').addEventListener('click', () => {
    document.getElementById('add-order-form').classList.remove('hidden');
});

document.getElementById('cancel-order-btn').addEventListener('click', () => {
    document.getElementById('add-order-form').classList.add('hidden');
    document.querySelector('#add-order-form .form').reset();
});

// Submit Add Order Form
document.querySelector('#add-order-form .form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const order = {
        customer_name: document.getElementById('order-customer').value,
        product_id: parseInt(document.getElementById('order-product').value),
        quantity: parseInt(document.getElementById('order-quantity').value),
        total_price: parseFloat(document.getElementById('order-price').value)
    };
    
    try {
        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        
        document.getElementById('add-order-form').classList.add('hidden');
        document.querySelector('#add-order-form .form').reset();
        loadOrders();
        alert('✓ Order created successfully!');
    } catch (error) {
        console.error('Error creating order:', error);
        alert('✗ Error creating order');
    }
});

async function updateOrderStatus(id, status) {
    try {
        await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

async function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        try {
            // Note: Delete order endpoint would need to be implemented in backend
            alert('Delete order feature coming soon!');
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
}

// Initialize
window.addEventListener('load', () => {
    loadDashboard();
});

.status-select {
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
}
