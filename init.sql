CREATE DATABASE IF NOT EXISTS ridhoponic_db;
USE ridhoponic_db;

-- Table for Products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    items JSON,
    total INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Site Content
CREATE TABLE IF NOT EXISTS site_content (
    content_key VARCHAR(100) PRIMARY KEY,
    content_value TEXT
);

-- Table for Settings (like admin password)
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
);

-- Seed Initial Products
INSERT INTO products (name, category, price, description, image) VALUES
('Selada Hijau', 'harvest', 18000, 'Renyah & Manis', 'assets/hero_lettuce.png'),
('Daun Bawang', 'harvest', 12000, 'Aromatik Segar', 'assets/product_scallions.png'),
('Daun Pegagan', 'harvest', 25000, 'Tanaman Herbal', 'assets/product_pegagan_popohan.png'),
('Daun Popohan', 'harvest', 22000, 'Sayuran Tradisional', 'assets/product_pegagan_popohan.png'),
('Benih Sayuran Premium', 'supplies', 15000, 'Berbagai Varian', 'assets/product_seeds_equipment.png'),
('Nutrisi AB Mix', 'supplies', 45000, '1 Liter Set', 'assets/product_seeds_equipment.png'),
('Netpot Hidroponik', 'supplies', 10000, 'Set 20 Pcs', 'assets/product_seeds_equipment.png');

-- Seed Initial Content
INSERT INTO site_content (content_key, content_value) VALUES
('hero-subtitle', 'Pertanian Berkelanjutan'),
('hero-title', 'Hidroponik Premium, <br>Segar Sampai Meja Anda.'),
('hero-desc', 'Menanam sayuran padat nutrisi di lingkungan terkontrol tanpa pestisida. Pengiriman segar langsung dari kebun kami di Sumedang.'),
('hero-img', 'assets/hero_lettuce.png'),
('about-title', 'Tentang Kami'),
('about-p1', '<strong>RIDHOPONIC FARM</strong> hadir sebagai solusi pertanian masa depan yang memadukan teknologi hidroponik modern dengan komitmen terhadap keamanan pangan. Berbasis di Kecamatan Tanjungsari, Kabupaten Sumedang, Jawa Barat, kami berfokus pada produksi sayuran segar berkualitas tinggi yang dikembangkan di lingkungan terkontrol.'),
('about-p2', 'Kepercayaan konsumen adalah prioritas utama kami. Oleh karena itu, seluruh operasional dan produk RIDHOPONIC FARM telah resmi terdaftar dalam sistem <strong>Nomor Induk Berusaha (NIB): 1712240062057</strong> dan menjamin aspek kehalalan melalui <strong>Sertifikasi HALAL Indonesia</strong>. Dengan standar manajemen nutrisi yang ketat dan sistem panen harian, kami memastikan setiap helai sayuran yang sampai ke meja Anda adalah produk yang legal, aman, and penuh nutrisi.'),
('about-img', 'assets/hero_lettuce.png'),
('contact-address', 'Jalan Raya Tanjungsari Nomor 345, RT/RW 003/004, Dusun Langensari, Desa Gudang, Kec. Tanjungsari, Kab. Sumedang, Jawa Barat, 45362'),
('contact-wa', '085176960803 | 085220933263'),
('contact-hours', 'Senin – Jumat: 08:00 - 17:00 WIB');

-- Seed Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pass', '12345');