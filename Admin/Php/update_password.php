<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../Accounts/db_connection.php';
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$newPassword = $data['password'] ?? '';
if (empty($email) || empty($newPassword)) {
    echo json_encode(["success" => false, "message" => "Email or password missing."]);
    exit;
}
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->bind_param("ss", $hashedPassword, $email);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Password updated successfully for $email"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update password."]);
}
$stmt->close();
$conn->close();
?>
