document.addEventListener('DOMContentLoaded', () => {
    // --- Security & Session Management (Local Storage) ---
    const loginOverlay = document.getElementById('login-overlay');
    const dashboard = document.getElementById('dashboard');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

    const getSettings = () => JSON.parse(localStorage.getItem('ridhoponic_settings')) || { password: '12345' };

    const checkAuth = async () => {
        const pass = passwordInput.value;
        try {
            const response = await fetch('api.php?action=get_settings');
            const settings = await response.json();
            
            if (settings.error) {
                console.error('Database Error:', settings.error);
                alert('Database belum siap: ' + settings.error + '\nPastikan Anda sudah menjalankan init.sql.');
                return;
            }

            const dbPass = settings.admin_pass || '12345';

            if (pass === dbPass) {
                loginOverlay.style.display = 'none';
                dashboard.classList.add('visible');
                localStorage.setItem('ridhoponic_session', Date.now());
                initDashboard();
            } else {
                alert('Password salah!');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Gagal terhubung ke database. Silakan periksa koneksi internet atau server.');
        }
    };

    const updateActivity = () => {
        if (!loginOverlay.style.display || loginOverlay.style.display === 'flex') return;
        localStorage.setItem('ridhoponic_session', Date.now());
    };

    const checkSession = () => {
        const lastActivity = localStorage.getItem('ridhoponic_session');
        if (lastActivity && (Date.now() - lastActivity > SESSION_TIMEOUT)) {
            alert('Sesi habis. Silakan login kembali.');
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('ridhoponic_session');
        window.location.reload();
    };

    loginBtn.addEventListener('click', checkAuth);
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAuth(); });
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(e => document.addEventListener(e, updateActivity, true));
    setInterval(checkSession, 60000); // Check every minute

    // Mobile Sidebar Toggle
    const adminMenuToggle = document.getElementById('admin-menu-toggle');
    const adminSidebar = document.getElementById('admin-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const toggleSidebar = () => {
        adminSidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    };

    adminMenuToggle?.addEventListener('click', toggleSidebar);
    sidebarOverlay?.addEventListener('click', toggleSidebar);

    // --- Navigation & Logout ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.getAttribute('data-section');
            if (!sectionName) return;
            
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = `section-${sectionName}`;
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');

            if (window.innerWidth <= 992 && adminSidebar.classList.contains('open')) toggleSidebar();
        });
    });

    // --- Dashboard Data Management (Local Storage) ---
    
    const initDashboard = async () => {
        await updateStats();
        await fetchOrders();
        await fetchProducts();
        await fetchContent();
    };

    const getOrders = async () => {
        try {
            const response = await fetch('api.php?action=get_orders');
            const data = await response.json();
            if (data.error) {
                console.error('DB Error:', data.error);
                return [];
            }
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Error fetching orders:', e);
            return [];
        }
    };

    const getProducts = async () => {
        try {
            const response = await fetch('api.php?action=get_products');
            const data = await response.json();
            if (data.error) {
                console.error('DB Error:', data.error);
                return [];
            }
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Error fetching products:', e);
            return [];
        }
    };

    const updateStats = async () => {
        const orders = await getOrders();
        const products = await getProducts();
        document.getElementById('stat-products').textContent = products.length;
        document.getElementById('stat-orders').textContent = orders.length;
        const totalRev = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        document.getElementById('stat-revenue').textContent = `IDR ${totalRev.toLocaleString('id-ID')}`;
    };

    // --- Orders ---
    const fetchOrders = async () => {
        const orders = await getOrders();
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        // Render Recent Activity (Home tab)
        const recentActivityTable = document.getElementById('recent-activity-body');
        if (recentActivityTable) {
            recentActivityTable.innerHTML = orders.length > 0 ? orders.slice(0, 5).map(o => `
                <tr>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td>Pesanan Baru #${o.id}</td>
                    <td>IDR ${(parseFloat(o.total)||0).toLocaleString('id-ID')}</td>
                </tr>
            `).join('') : '<tr><td colspan="3">Belum ada aktivitas.</td></tr>';
        }

        // Render Orders Table
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada pesanan masuk.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => {
            const date = new Date(order.created_at).toLocaleString('id-ID');
            let itemsHTML = '';
            try {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                itemsHTML = items.map(i => `${i.name} (${i.quantity}x)`).join(', ');
            } catch(e) {}
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${date}</td>
                    <td>${itemsHTML}</td>
                    <td>IDR ${(parseFloat(order.total)||0).toLocaleString('id-ID')}</td>
                    <td>${order.status}</td>
                    <td><button class="btn-secondary" onclick="deleteOrder('${order.id}')" style="color:red; padding:0.5rem;">Hapus</button></td>
                </tr>
            `;
        }).join('');
    };

    window.deleteOrder = async (id) => {
        if(confirm('Yakin hapus orderan ini?')) {
            try {
                await fetch(`api.php?action=delete_order&id=${id}`);
                await initDashboard();
            } catch (e) {
                console.error('Delete order error:', e);
            }
        }
    };

    // --- Products ---
    const fetchProducts = async () => {
        const products = await getProducts();
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Produk kosong. Pastikan Anda sudah menjalankan init.sql atau tambah produk baru.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;"></td>
                <td>${product.name}</td>
                <td>${product.category === 'harvest' ? 'Hasil Panen' : 'Bibit & Alat'}</td>
                <td>IDR ${(parseFloat(product.price)||0).toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn-secondary" onclick="editProduct('${product.id}')" style="padding:0.5rem; margin-right:0.5rem;">Edit</button>
                    <button class="btn-secondary" onclick="deleteProduct('${product.id}')" style="color:red; padding:0.5rem;">Hapus</button>
                </td>
            </tr>
        `).join('');
    };

    // Product Modal Handling
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('edit-product-id').value = '';
        productModal.style.display = 'flex';
    });

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    window.editProduct = async (id) => {
        const products = await getProducts();
        const product = products.find(p => p.id == id);
        if (product) {
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('p-name').value = product.name;
            document.getElementById('p-category').value = product.category;
            document.getElementById('p-price').value = product.price;
            document.getElementById('p-desc').value = product.description;
            document.getElementById('p-image').value = product.image;
            productModal.style.display = 'flex';
        }
    };

    window.deleteProduct = async (id) => {
        if(confirm('Hapus produk ini?')) {
            try {
                await fetch(`api.php?action=delete_product&id=${id}`);
                await initDashboard();
            } catch (e) {
                console.error('Delete product error:', e);
            }
        }
    };

    productForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('upload-p-img');
        
        const saveProduct = async (imgData) => {
            const prodId = document.getElementById('edit-product-id').value;
            const newProduct = {
                id: prodId || '',
                name: document.getElementById('p-name').value,
                category: document.getElementById('p-category').value,
                price: document.getElementById('p-price').value,
                description: document.getElementById('p-desc').value,
                image: imgData || document.getElementById('p-image').value || 'assets/hero_lettuce.png'
            };

            try {
                await fetch('api.php?action=save_product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });
                productModal.style.display = 'none';
                await initDashboard();
            } catch (err) {
                console.error('Save product error:', err);
            }
        };

        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => saveProduct(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveProduct(null);
        }
    });

    // --- Content Management ---
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

    const fetchContent = async () => {
        try {
            const response = await fetch('api.php?action=get_content');
            const dbContent = await response.json();
            const content = { ...defaultContent, ...dbContent };

            // Map to inputs
            ['hero-subtitle', 'hero-title', 'hero-desc', 'about-title', 'about-p1', 'about-p2', 'contact-address', 'contact-wa', 'contact-hours'].forEach(id => {
                const input = document.getElementById(`edit-${id}`);
                if (input) input.value = content[id] || '';
            });
            
            // Previews
            if (content['hero-img']) document.getElementById('preview-hero-img').src = content['hero-img'];
            if (content['about-img']) document.getElementById('preview-about-img').src = content['about-img'];
        } catch (e) {
            console.error('Fetch content error:', e);
        }
    };

    document.getElementById('save-content-btn')?.addEventListener('click', async () => {
        const response = await fetch('api.php?action=get_content');
        const content = await response.json();
        
        const btn = document.getElementById('save-content-btn');
        btn.textContent = 'Menyimpan...';

        // Get text inputs
        ['hero-subtitle', 'hero-title', 'hero-desc', 'about-title', 'about-p1', 'about-p2', 'contact-address', 'contact-wa', 'contact-hours'].forEach(id => {
            const el = document.getElementById(`edit-${id}`);
            if(el) content[id] = el.value;
        });

        // Get file inputs via FileReader promise
        const getBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const heroImg = document.getElementById('upload-hero-img').files[0];
        if (heroImg) content['hero-img'] = await getBase64(heroImg);

        const aboutImg = document.getElementById('upload-about-img').files[0];
        if (aboutImg) content['about-img'] = await getBase64(aboutImg);

        try {
            await fetch('api.php?action=save_content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            alert('Konten berhasil disimpan ke Database!');
            await fetchContent();
        } catch (err) {
            console.error('Save content error:', err);
        }
        btn.textContent = 'Simpan Semua Konten';
    });

    // --- Settings ---
    document.getElementById('save-password-btn')?.addEventListener('click', async () => {
        const newPass = document.getElementById('new-password').value;
        if(newPass.trim() !== '') {
            try {
                await fetch('api.php?action=save_password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPass })
                });
                alert('Password berhasil diperbarui di Database!');
                document.getElementById('new-password').value = '';
            } catch (err) {
                console.error('Save password error:', err);
            }
        } else {
            alert('Password tidak boleh kosong');
        }
    });

});
