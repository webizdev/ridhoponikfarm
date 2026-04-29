// Ridhoponic Farm - Web Logic & Cart System (Demo Mode - Local Storage)
document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        for (let i = 0; i < revealElements.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = revealElements[i].getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                revealElements[i].classList.add('active');
            }
        }
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Cart System ---
    let cart = JSON.parse(localStorage.getItem('ridhoponic_cart')) || [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueBtn = document.getElementById('continue-shopping-btn');

    const toggleCart = () => {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    };

    cartToggle?.addEventListener('click', toggleCart);
    cartClose?.addEventListener('click', toggleCart);
    cartOverlay?.addEventListener('click', toggleCart);

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (cartSidebar.classList.contains('open')) toggleCart();
            const catalogSection = document.getElementById('catalog');
            if (catalogSection) {
                window.scrollTo({ top: catalogSection.offsetTop - 80, behavior: 'smooth' });
            }
        });
    }

    const saveAndRenderCart = () => {
        localStorage.setItem('ridhoponic_cart', JSON.stringify(cart));
        renderCart();
    };

    const renderCart = () => {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Keranjang Anda kosong.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x IDR ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="updateCartItem('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartItem('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
            `).join('');
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalElement) cartTotalElement.textContent = `IDR ${total.toLocaleString('id-ID')}`;
        if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    window.updateCartItem = (id, newQty) => {
        if (newQty <= 0) {
            cart = cart.filter(item => item.id !== id);
        } else {
            const item = cart.find(i => i.id === id);
            if (item) item.quantity = newQty;
        }
        saveAndRenderCart();
    };

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    menuToggle?.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links-desktop a').forEach(link => {
        link.addEventListener('click', () => mainNav.classList.remove('active'));
    });

    // --- Content Management (Local Storage) ---
    const defaultContent = {
        'hero-subtitle': 'Pertanian Berkelanjutan',
        'hero-title': 'Hidroponik Premium, <br>Segar Sampai Meja Anda.',
        'hero-desc': 'Menanam sayuran padat nutrisi di lingkungan terkontrol tanpa pestisida. Pengiriman segar langsung dari kebun kami di Sumedang.',
        'hero-img': 'assets/hero_lettuce.png',
        'about-title': 'Tentang Kami',
        'about-p1': '<strong>RIDHOPONIC FARM</strong> hadir sebagai solusi pertanian masa depan yang memadukan teknologi hidroponik modern dengan komitmen terhadap keamanan pangan. Berbasis di Kecamatan Tanjungsari, Kabupaten Sumedang, Jawa Barat, kami berfokus pada produksi sayuran segar berkualitas tinggi yang dikembangkan di lingkungan terkontrol.',
        'about-p2': 'Kepercayaan konsumen adalah prioritas utama kami. Oleh karena itu, seluruh operasional dan produk RIDHOPONIC FARM telah resmi terdaftar dalam sistem <strong style="white-space: nowrap;">NIB: 1712240062057</strong> dan menjamin aspek kehalalan melalui <strong>Sertifikasi HALAL Indonesia</strong>. Dengan standar manajemen nutrisi yang ketat dan sistem panen harian, kami memastikan setiap helai sayuran yang sampai ke meja Anda adalah produk yang legal, aman, dan penuh nutrisi.',
        'about-img': 'assets/hero_lettuce.png',
        'contact-address': 'Jalan Raya Tanjungsari Nomor 345, RT/RW 003/004, Dusun Langensari, Desa Gudang, Kec. Tanjungsari, Kab. Sumedang, Jawa Barat, 45362',
        'contact-wa': '085176960803 | 085220933263',
        'contact-hours': 'Senin – Jumat: 08:00 - 17:00 WIB'
    };

    const fetchContent = () => {
        const content = JSON.parse(localStorage.getItem('ridhoponic_content')) || defaultContent;
        Object.keys(content).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'IMG') el.src = content[id];
                else el.innerHTML = content[id];
            }
        });
    };

    // --- Product Management (Local Storage) ---
    const defaultProducts = [
        { id: "1", name: "Selada Hijau", category: "harvest", price: 18000, description: "Renyah & Manis", image: "assets/hero_lettuce.png" },
        { id: "2", name: "Daun Bawang", category: "harvest", price: 12000, description: "Aromatik Segar", image: "assets/product_scallions.png" },
        { id: "3", name: "Daun Pegagan", category: "harvest", price: 25000, description: "Tanaman Herbal", image: "assets/product_pegagan_popohan.png" },
        { id: "4", name: "Daun Popohan", category: "harvest", price: 22000, description: "Sayuran Tradisional", image: "assets/product_pegagan_popohan.png" },
        { id: "5", name: "Benih Sayuran Premium", category: "supplies", price: 15000, description: "Berbagai Varian", image: "assets/product_seeds_equipment.png" },
        { id: "6", name: "Nutrisi AB Mix", category: "supplies", price: 45000, description: "1 Liter Set", image: "assets/product_seeds_equipment.png" },
        { id: "7", name: "Netpot Hidroponik", category: "supplies", price: 10000, description: "Set 20 Pcs", image: "assets/product_seeds_equipment.png" },
        { id: "8", name: "Rockwool Hidroponik", category: "supplies", price: 18000, description: "Set 18 Pcs", image: "assets/product_seeds_equipment.png" }
    ];

    let products = [];
    let visibleCount = 6;
    const catalogGrid = document.querySelector('.catalog-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const fetchProducts = () => {
        products = JSON.parse(localStorage.getItem('ridhoponic_products')) || defaultProducts;
        renderProducts();
    };

    const renderProducts = () => {
        if (!catalogGrid) return;
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        catalogGrid.innerHTML = products.map((product, index) => {
            const isVisible = (currentFilter === 'all' || product.category === currentFilter);
            // On 'all' filter, we apply the Load More limit. On specific categories, we show all filtered items.
            const shouldHide = currentFilter === 'all' && index >= visibleCount;
            
            return `
                <article class="product-card reveal active ${isVisible ? '' : 'hidden-product'} ${shouldHide ? 'hidden-product' : ''}" data-category="${product.category}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div>
                            <h3>${product.name}</h3>
                            <p>${product.description || ''}</p>
                        </div>
                        <span class="product-price">${(product.price / 1000).toFixed(0)}rb</span>
                    </div>
                    <button class="add-to-cart-btn" 
                        data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}">Tambah ke Keranjang</button>
                </article>
            `;
        }).join('');

        // Handle Load More Button Visibility
        if (loadMoreBtn) {
            if (currentFilter === 'all' && visibleCount < products.length) {
                loadMoreBtn.parentElement.style.display = 'block';
            } else {
                loadMoreBtn.parentElement.style.display = 'none';
            }
        }

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const price = parseInt(btn.getAttribute('data-price'));
                const existing = cart.find(i => i.id == id);
                if (existing) existing.quantity++;
                else cart.push({ id, name, price, quantity: 1 });
                saveAndRenderCart();
                if (!cartSidebar.classList.contains('open')) toggleCart();
            });
        });
    };

    loadMoreBtn?.addEventListener('click', () => {
        visibleCount = products.length; // Show all
        renderProducts();
        // Trigger reveal for new items
        setTimeout(revealOnScroll, 100);
    });

    // Checkout via WhatsApp & Save Order Locally
    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) return alert('Keranjang kosong!');
        const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        // Save order to Local Storage for Admin
        const orders = JSON.parse(localStorage.getItem('ridhoponic_orders')) || [];
        const newOrder = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            items: [...cart],
            total: total,
            status: 'Pending'
        };
        orders.push(newOrder);
        localStorage.setItem('ridhoponic_orders', JSON.stringify(orders));

        // Format WhatsApp Message
        let msg = 'Halo Ridhoponic Farm, saya memesan:\n\n';
        cart.forEach((i, idx) => msg += `${idx+1}. ${i.name} (${i.quantity}x)\n`);
        msg += `\nTotal: IDR ${total.toLocaleString('id-ID')}`;
        window.open(`https://wa.me/6285176960803?text=${encodeURIComponent(msg)}`, '_blank');
        
        cart = [];
        saveAndRenderCart();
        toggleCart();
    });

    // Initial load
    fetchContent();
    fetchProducts();
    renderCart();

    // Filter Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });
});
