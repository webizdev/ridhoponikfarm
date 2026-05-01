<?php
$host = 'localhost';
$db   = 'alilogis_ridhoponicfarm';
$user = 'alilogis_ridhoponicfarm';
$pass = 'WSYLBt7EZHzyH4wLg6BZ';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("ALTER TABLE site_content MODIFY content_value LONGTEXT");
    $pdo->exec("ALTER TABLE products MODIFY image LONGTEXT");
    $pdo->exec("ALTER TABLE products MODIFY description LONGTEXT");
    echo "<h1>Database Berhasil Diperbaiki!</h1><p>Batas ukuran gambar sekarang sudah diperbesar. Anda bisa menutup halaman ini.</p>";
} catch (PDOException $e) {
    echo "<h1>Gagal:</h1> " . $e->getMessage();
}
?>