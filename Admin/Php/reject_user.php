<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../Accounts/db_connection.php';
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}
 
$data = json_decode(file_get_contents("php://input"), true);
$email = $conn->real_escape_string($data['email']);

$query = "UPDATE users SET status='rejected' WHERE email='$email'";
if ($conn->query($query)) {
    echo json_encode(["success" => true, "message" => "User rejected successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to reject user"]);
}

$conn->close();
?>
