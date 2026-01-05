<?php
require 'db_connection.php';

// Get the input from the request body
$input = json_decode(file_get_contents("php://input"), true);
$newPassword = $input['newPassword'] ?? '';
$adminId = $input['adminId'] ?? null;

// Check if both parameters are provided
if (empty($newPassword) || empty($adminId)) {
    echo json_encode(["status" => "error", "message" => "Password and Admin ID are required."]);
    exit;
}

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update the password in the database
$sql = "UPDATE users SET password = ? WHERE id = ? AND role = 'admin'"; 
$stmt = $mysqli->prepare($sql);

// Bind parameters
$stmt->bind_param('si', $hashedPassword, $adminId);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Password reset successful"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to reset password"]);
}

// Close the statement and connection
$stmt->close();
$mysqli->close();
?>
