<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

$query = "SELECT fullname, email FROM users WHERE role = 'admin'";
$result = $conn->query($query);
$admins = [];

while ($row = $result->fetch_assoc()) {
  $admins[] = $row;
}

echo json_encode($admins);

$conn->close();
?>