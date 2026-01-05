<?php
header('Content-Type: application/json');

// Database connection
require_once __DIR__ . '/db_connection.php';

// Get JSON POST body
$input = json_decode(file_get_contents("php://input"), true);
$token = $conn->real_escape_string(trim($input['token'] ?? ''));
$newPassword = trim($input['new_password'] ?? '');

if (empty($token) || empty($newPassword)) {
    echo json_encode(["success" => false, "message" => "Token and new password are required."]);
    exit;
}

// Find user with matching reset token
$sql = "SELECT id, email FROM users WHERE reset_password = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid or expired reset token.",
        "expired" => true
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password and clear reset token
$updateSql = "UPDATE users SET password = ?, reset_password = NULL WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("si", $hashedPassword, $user['id']);

if ($updateStmt->execute()) {
    echo json_encode([
        "success" => true, 
        "message" => "Password has been successfully reset."
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Failed to reset password. Please try again."
    ]);
}

$conn->close();
?>
