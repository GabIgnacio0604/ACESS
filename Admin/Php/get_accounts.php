<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

// Fetch pending users
$applications = [];
$query1 = "SELECT id, fullname, email, password, lrn, role, status FROM users WHERE status='pending'";
$result1 = $conn->query($query1);
if ($result1) { 
    while ($row = $result1->fetch_assoc()) {
        $applications[] = $row;
    }
}

// Fetch approved (active) users
$accounts = [];
$query2 = "SELECT id, fullname, email, password, lrn, role, status FROM users WHERE status='active'";
$result2 = $conn->query($query2);
if ($result2) {
    while ($row = $result2->fetch_assoc()) {
        $accounts[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "applications" => $applications,
    "accounts" => $accounts
]);

$conn->close();
?>