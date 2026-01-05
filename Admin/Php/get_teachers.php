<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// Fetch only teachers from the users table
$query = "SELECT id, fullname AS name FROM users WHERE role = 'teacher'";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(['error' => 'Query failed: ' . $conn->error]);
    exit;
}

$teachers = [];
while ($row = $result->fetch_assoc()) {
    $teachers[] = $row;
}

echo json_encode($teachers);

$conn->close();
?>