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
    const fetchContent = async () => {
        try {
            const response = await fetch('api.php?action=get_content');
            const content = await response.json();
            
            if (content.error) {
                console.error('DB Content Error:', content.error);
                return;
            }

            Object.keys(content).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'IMG') el.src = content[id];
                    else el.innerHTML = content[id];
                }
            });
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    let products = [];
    let visibleCount = 6;
    const catalogGrid = document.getElementById('product-list');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const fetchProducts = async () => {
        try {
            const response = await fetch('api.php?action=get_products');
            const dbProducts = await response.json();
            
            if (dbProducts.error) {
                console.error('DB Products Error:', dbProducts.error);
                catalogGrid.innerHTML = '<p class="error-msg">Gagal memuat produk. Hubungi admin.</p>';
                return;
            }

            products = dbProducts;
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            catalogGrid.innerHTML = '<p class="error-msg">Koneksi gagal. Silakan muat ulang halaman.</p>';
        }
    };

    const renderProducts = () => {
        if (!catalogGrid) return;
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        if (products.length === 0) {
            catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;">Produk belum tersedia.</div>';
            if (loadMoreBtn) loadMoreBtn.parentElement.style.display = 'none';
            return;
        }

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
                        <h3>${product.name}</h3>
                        <p class="product-desc">${product.description || ''}</p>
                        <p class="product-price">IDR ${parseInt(product.price).toLocaleString('id-ID')}</p>
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
    checkoutBtn?.addEventListener('click', async () => {
        if (cart.length === 0) return alert('Keranjang kosong!');
        const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        try {
            // Save order to SQL Database
            const orderData = {
                items: cart,
                total: total
            };

            const response = await fetch('api.php?action=add_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to save order to database');

            // Format WhatsApp Message
            let msg = 'Halo Ridhoponic Farm, saya memesan:\n\n';
            cart.forEach((i, idx) => msg += `${idx+1}. ${i.name} (${i.quantity}x)\n`);
            msg += `\nTotal: IDR ${total.toLocaleString('id-ID')}`;
            msg += '\n\nApakah stok masih tersedia?';
            
            const waUrl = `https://wa.me/6285176960803?text=${encodeURIComponent(msg)}`;
            
            // Clear cart & redirect
            cart = [];
            saveAndRenderCart();
            toggleCart();
            window.open(waUrl, '_blank');
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi atau hubungi via WhatsApp langsung.');
        }
    });

    // Category Filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Reset visible count on filter change
            visibleCount = 6;
            
            renderProducts();
            setTimeout(revealOnScroll, 100);
        });
    });

    // Header Shrink on Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.height = '60px';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            header.style.height = '80px';
            header.style.boxShadow = 'none';
        }
    });

    // Fetch initial data
    fetchContent();
    fetchProducts();
    
    // Initial Render Cart
    renderCart();
});