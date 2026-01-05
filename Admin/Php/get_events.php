<?php
header('Content-Type: application/json');

// Include database connection
require_once(__DIR__ . '/../../Accounts/db_connection.php');

// Safety check
if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Query events
$sql = "SELECT id, date, title FROM events ORDER BY date ASC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit;
}

// Build response
$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode($events);
$conn->close();
?>
