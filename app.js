/**
 * Ridhoponic Farm - App Logic
 */

const app = {
    cart: [],
    products: [],
    siteContent: {},

    init() {
        this.loadLocalData();
        this.bindEvents();
        this.setupRevealAnimations();
        this.renderProducts();
        this.updateCartCount();
        this.applySiteContent();
    },

    loadLocalData() {
        // Products
        const localProducts = localStorage.getItem('rp_products');
        if (localProducts) {
            this.products = JSON.parse(localProducts);
        } else {
            // Default demo products from HTML
            this.products = [
                { id: 1, name: 'Selada Hijau', category: 'harvest', price: 18000, image: 'assets/hero_lettuce.png' },
                { id: 2, name: 'Daun Bawang', category: 'harvest', price: 12000, image: 'assets/product_scallions.png' },
                { id: 3, name: 'Daun Pegagan', category: 'harvest', price: 25000, image: 'assets/product_pegagan_popohan.png' },
                { id: 4, name: 'Daun Popohan', category: 'harvest', price: 22000, image: 'assets/product_pegagan_popohan.png' },
                { id: 5, name: 'Benih Sayuran Premium', category: 'supplies', price: 15000, image: 'assets/product_seeds_equipment.png' },
                { id: 6, name: 'Nutrisi AB Mix', category: 'supplies', price: 45000, image: 'assets/product_seeds_equipment.png' },
                { id: 7, name: 'Netpot Hidroponik', category: 'supplies', price: 10000, image: 'assets/product_seeds_equipment.png' }
            ];
        }

        // Cart
        const localCart = localStorage.getItem('rp_cart');
        this.cart = localCart ? JSON.parse(localCart) : [];

        // Content
        const localContent = localStorage.getItem('rp_content');
        if (localContent) {
            this.siteContent = JSON.parse(localContent);
        }
    },

    applySiteContent() {
        if (!this.siteContent) return;
        
        Object.keys(this.siteContent).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'IMG') {
                    el.src = this.siteContent[id];
                } else {
                    el.textContent = this.siteContent[id];
                }
            }
        });
    },

    bindEvents() {
        // Cart Toggle
        document.getElementById('cart-toggle').addEventListener('click', () => this.toggleCart(true));
        document.getElementById('cart-close').addEventListener('click', () => this.toggleCart(false));
        document.getElementById('cart-overlay').addEventListener('click', () => this.toggleCart(false));
        document.getElementById('continue-shopping-btn').addEventListener('click', () => this.toggleCart(false));

        // Mobile Menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('main-nav').classList.toggle('active');
        });

        // Filter Logic
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterProducts(filter);
                
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Checkout
        document.getElementById('checkout-btn').addEventListener('click', () => this.checkout());

        // Delegation for Add to Cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const name = e.target.getAttribute('data-name');
                const price = parseInt(e.target.getAttribute('data-price'));
                this.addToCart(id, name, price);
            }
        });
    },

    renderProducts() {
        const grid = document.querySelector('.catalog-grid');
        if (!grid) return;
        
        grid.innerHTML = this.products.map(p => `
            <article class="product-card reveal active" data-category="${p.category}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <div>
                        <h3>${p.name}</h3>
                        <p>${p.category === 'harvest' ? 'Segar & Organik' : 'Kualitas Premium'}</p>
                    </div>
                    <span class="product-price">${(p.price / 1000)}rb</span>
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Tambah ke Keranjang</button>
            </article>
        `).join('');
    },

    filterProducts(category) {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    addToCart(id, name, price) {
        const existing = this.cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({ id, name, price, qty: 1 });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.toggleCart(true);
    },

    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    },

    saveCart() {
        localStorage.setItem('rp_cart', JSON.stringify(this.cart));
    },

    updateCartCount() {
        const count = this.cart.reduce((acc, item) => acc + item.qty, 0);
        document.getElementById('cart-count').textContent = count;
    },

    toggleCart(open) {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            this.renderCart();
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    },

    renderCart() {
        const container = document.getElementById('cart-items-container');
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Keranjang Anda kosong.</p>';
            document.getElementById('cart-total').textContent = 'IDR 0';
            return;
        }

        let total = 0;
        container.innerHTML = this.cart.map(item => {
            total += item.price * item.qty;
            return `
                <div class="cart-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.qty} x IDR ${item.price.toLocaleString()}</p>
                    </div>
                    <button onclick="app.removeFromCart(${item.id})" style="background:none; border:none; color: #ff4d4d; cursor:pointer;">Hapus</button>
                </div>
            `;
        }).join('');

        document.getElementById('cart-total').textContent = `IDR ${total.toLocaleString()}`;
    },

    checkout() {
        if (this.cart.length === 0) return;
        
        const total = this.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        let message = "Halo Ridhoponic Farm, saya ingin memesan:\n\n";
        
        this.cart.forEach(item => {
            message += `- ${item.name} (${item.qty}x)\n`;
        });
        
        message += `\nTotal: IDR ${total.toLocaleString()}`;
        message += `\n\nMohon informasi selanjutnya. Terima kasih!`;
        
        const waUrl = `https://wa.me/6285176960803?text=${encodeURIComponent(message)}`;
        
        // Save to demo orders
        const order = {
            id: Date.now(),
            customer_name: 'WhatsApp Customer',
            items: this.cart,
            total: total,
            date: new Date().toISOString()
        };
        const localOrders = localStorage.getItem('rp_orders');
        const orders = localOrders ? JSON.parse(localOrders) : [];
        orders.unshift(order);
        localStorage.setItem('rp_orders', JSON.stringify(orders));

        window.open(waUrl, '_blank');
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.toggleCart(false);
    },

    setupRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
