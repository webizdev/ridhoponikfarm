<?php
header('Content-Type: application/json');

$host = 'db';
$db   = 'ridhoponic_db';
$user = 'root';
$pass = 'root';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_products':
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'save_product':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['id']) && $data['id'] != '') {
            $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, price=?, description=?, image=? WHERE id=?");
            $stmt->execute([$data['name'], $data['category'], $data['price'], $data['description'], $data['image'], $data['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO products (name, category, price, description, image) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['category'], $data['price'], $data['description'], $data['image']]);
        }
        echo json_encode(['success' => true]);
        break;

    case 'delete_product':
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    case 'get_content':
        $stmt = $pdo->query("SELECT * FROM site_content");
        $results = $stmt->fetchAll();
        $content = [];
        foreach ($results as $row) {
            $content[$row['content_key']] = $row['content_value'];
        }
        echo json_encode($content);
        break;

    case 'save_content':
        $data = json_decode(file_get_contents('php://input'), true);
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_value=?");
            $stmt->execute([$key, $value, $value]);
        }
        echo json_encode(['success' => true]);
        break;

    case 'get_orders':
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
        $orders = $stmt->fetchAll();
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'], true);
        }
        echo json_encode($orders);
        break;

    case 'add_order':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO orders (customer_name, items, total, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['customer_name'] ?? 'WhatsApp Order', json_encode($data['items']), $data['total'], 'Paid']);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;

    case 'delete_order':
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM orders WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    case 'get_settings':
        $stmt = $pdo->query("SELECT * FROM settings");
        $results = $stmt->fetchAll();
        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        echo json_encode($settings);
        break;

    case 'save_password':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE settings SET setting_value=? WHERE setting_key='admin_pass'");
        $stmt->execute([$data['password']]);
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?>