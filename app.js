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
    const catalogGrid = document.getElementById('product-grid');
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

        // Attach event listeners to new Add to Cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const name = e.target.dataset.name;
                const price = parseFloat(e.target.dataset.price);

                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ id, name, price, quantity: 1 });
                }
                
                saveAndRenderCart();
                
                // Show notification feedback
                const originalText = e.target.textContent;
                e.target.textContent = 'Ditambahkan!';
                e.target.style.background = 'var(--accent)';
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.style.background = 'var(--primary)';
                }, 1000);
            });
        });
    };

    // Handle Category Filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // If user changes category, reset visibleCount to show initial items again if they return to 'all'
            // Optional: reset visibleCount = 6; 
            
            renderProducts();
        });
    });

    // Handle Load More
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += 6; // Load 6 more items
            renderProducts();
        });
    }

    // Checkout via WhatsApp
    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang belanja Anda kosong.');
            return;
        }

        // Generate ID pesanan
        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
        let message = `Halo Ridhoponic Farm!%0ASaya ingin memesan produk berikut:%0A%0A`;
        
        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}. ${item.name} - ${item.quantity}x (IDR ${itemTotal.toLocaleString('id-ID')})%0A`;
            total += itemTotal;
        });

        message += `%0ATotal Pembayaran: *IDR ${total.toLocaleString('id-ID')}*%0A`;
        message += `ID Pesanan: ${orderId}%0A%0AMohon info cara pembayaran dan pengiriman. Terima kasih.`;

        // Save order to DB
        fetch('api.php?action=add_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: 'WhatsApp Order',
                items: cart,
                total: total
            })
        }).then(() => {
            // Clear cart
            cart = [];
            saveAndRenderCart();
            toggleCart();

            // Redirect to WA
            window.open(`https://wa.me/6285176960803?text=${message}`, '_blank');
        }).catch(err => {
            console.error('Failed to save order', err);
            // Still proceed to WA even if DB fails
            window.open(`https://wa.me/6285176960803?text=${message}`, '_blank');
        });
    });

    // Initialize Page
    renderCart();
    fetchContent();
    fetchProducts();
});
