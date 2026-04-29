/**
 * Admin Dashboard Logic
 * RIDHOPONICFARM
 */

const admin = {
    currentSection: 'dashboard',
    products: [],
    orders: [],
    siteContent: {},

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadData();
    },

    checkAuth() {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (isAuth) {
            document.getElementById('login-overlay').style.display = 'none';
        }
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Sidebar Toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('active');
            document.getElementById('sidebar-overlay').classList.add('active');
        });

        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
            document.getElementById('sidebar-overlay').classList.remove('active');
        });

        // Login
        document.getElementById('login-btn').addEventListener('click', () => {
            const pass = document.getElementById('login-pass').value;
            // Simple demo auth
            if (pass === '12345') {
                sessionStorage.setItem('admin_auth', 'true');
                document.getElementById('login-overlay').style.display = 'none';
            } else {
                alert('Password salah!');
            }
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            sessionStorage.removeItem('admin_auth');
            location.reload();
        });

        // Product Modal
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('product-modal').style.display = 'none';
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Image Preview
        document.getElementById('prod-image-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('prod-image-url').value = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    },

    showSection(sectionId) {
        this.currentSection = sectionId;
        
        // Update Nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });

        // Update Title
        const titles = {
            dashboard: 'Beranda',
            orders: 'Kelola Pesanan',
            products: 'Manajemen Produk',
            content: 'Edit Konten Situs',
            settings: 'Pengaturan'
        };
        document.getElementById('section-title').textContent = titles[sectionId] || 'Admin';

        // Update Visibility
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },

    loadData() {
        // Load from LocalStorage for Demo
        const localProducts = localStorage.getItem('rp_products');
        this.products = localProducts ? JSON.parse(localProducts) : [];

        const localOrders = localStorage.getItem('rp_orders');
        this.orders = localOrders ? JSON.parse(localOrders) : [];

        const localContent = localStorage.getItem('rp_content');
        this.siteContent = localContent ? JSON.parse(localContent) : {
            'hero-title': 'Hidroponik Premium, Segar Sampai Meja Anda.',
            'hero-desc': 'Menanam sayuran padat nutrisi di lingkungan terkontrol tanpa pestisida.',
            'about-p1': 'RIDHOPONIC FARM hadir sebagai solusi pertanian masa depan...',
            'contact-address': 'Jalan Raya Tanjungsari Nomor 345, Sumedang'
        };

        this.renderAll();
    },

    renderAll() {
        this.renderStats();
        this.renderProducts();
        this.renderOrders();
        this.renderContentEditor();
    },

    renderStats() {
        const totalSales = this.orders.reduce((acc, curr) => acc + curr.total, 0);
        document.getElementById('stat-total-sales').textContent = `IDR ${totalSales.toLocaleString()}`;
        document.getElementById('stat-orders-count').textContent = this.orders.length;
        document.getElementById('stat-products-count').textContent = this.products.length;
    },

    renderProducts() {
        const tbody = document.querySelector('#products-table tbody');
        tbody.innerHTML = this.products.map(p => `
            <tr>
                <td><img src="${p.image || 'assets/hero_lettuce.png'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
                <td>${p.name}</td>
                <td>${p.category === 'harvest' ? 'Panen' : 'Alat/Bibit'}</td>
                <td>${p.price.toLocaleString()}</td>
                <td>
                    <button onclick="admin.openProductModal(${p.id})" class="btn" style="padding: 4px 8px; font-size: 0.7rem; background: #e9ecef;">Edit</button>
                    <button onclick="admin.deleteProduct(${p.id})" class="btn" style="padding: 4px 8px; font-size: 0.7rem; background: #ffe3e3; color: #c00;">Hapus</button>
                </td>
            </tr>
        `).join('');
    },

    renderOrders() {
        const limit = 5;
        const recentOrders = this.orders.slice(0, limit);
        
        document.querySelector('#recent-orders-table tbody').innerHTML = recentOrders.map(o => `
            <tr>
                <td>#${o.id.toString().slice(-4)}</td>
                <td>${o.customer_name}</td>
                <td>IDR ${o.total.toLocaleString()}</td>
                <td><span style="background: #e7f5ff; color: #228be6; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem;">Selesai</span></td>
            </tr>
        `).join('');

        document.querySelector('#full-orders-table tbody').innerHTML = this.orders.map(o => `
            <tr>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td>${o.customer_name}</td>
                <td>${o.items.length} Produk</td>
                <td>IDR ${o.total.toLocaleString()}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;">Detail</button>
                </td>
            </tr>
        `).join('');
    },

    renderContentEditor() {
        const container = document.getElementById('content-management-container');
        container.innerHTML = Object.keys(this.siteContent).map(key => `
            <div class="content-card">
                <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; text-transform: capitalize;">${key.replace('-', ' ')}</label>
                <textarea id="edit-content-${key}" style="width: 100%; min-height: 80px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 8px;">${this.siteContent[key]}</textarea>
                <button onclick="admin.saveContentItem('${key}')" class="btn btn-primary" style="margin-top: 1rem; width: 100%; font-size: 0.8rem;">Update</button>
            </div>
        `).join('');
    },

    openProductModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        document.getElementById('modal-title').textContent = id ? 'Edit Produk' : 'Tambah Produk';
        
        if (id) {
            const p = this.products.find(prod => prod.id === id);
            document.getElementById('edit-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-category').value = p.category;
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-desc').value = p.desc || '';
            document.getElementById('prod-image-url').value = p.image || '';
        } else {
            form.reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('prod-image-url').value = '';
        }
        
        modal.style.display = 'flex';
    },

    saveProduct() {
        const id = document.getElementById('edit-id').value;
        const product = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseInt(document.getElementById('prod-price').value),
            desc: document.getElementById('prod-desc').value,
            image: document.getElementById('prod-image-url').value
        };

        if (id) {
            const index = this.products.findIndex(p => p.id === parseInt(id));
            this.products[index] = product;
        } else {
            this.products.unshift(product);
        }

        localStorage.setItem('rp_products', JSON.stringify(this.products));
        document.getElementById('product-modal').style.display = 'none';
        this.renderProducts();
        this.renderStats();
    },

    deleteProduct(id) {
        if (confirm('Hapus produk ini?')) {
            this.products = this.products.filter(p => p.id !== id);
            localStorage.setItem('rp_products', JSON.stringify(this.products));
            this.renderProducts();
            this.renderStats();
        }
    },

    saveContentItem(key) {
        const val = document.getElementById(`edit-content-${key}`).value;
        this.siteContent[key] = val;
        localStorage.setItem('rp_content', JSON.stringify(this.siteContent));
        alert('Konten diperbarui!');
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => admin.init());
