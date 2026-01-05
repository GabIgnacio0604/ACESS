<?php
header('Content-Type: application/json');

// Database connection
require_once __DIR__ . '/db_connection.php';
 
// Get JSON POST body
$input = json_decode(file_get_contents("php://input"), true);
$email = $conn->real_escape_string(trim($input['email'] ?? ''));
$fullname = $conn->real_escape_string(trim($input['fullname'] ?? ''));
$password = trim($input['password'] ?? '');
$lrn = $conn->real_escape_string(trim($input['lrn'] ?? ''));

if (empty($email) || empty($fullname) || empty($password) || empty($lrn)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

// Check if email already exists
$sql = "SELECT id FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already exists."]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$sql = "INSERT INTO users (email, fullname, password, lrn, role, status) VALUES (?, ?, ?, ?, 'user', 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $email, $fullname, $hashedPassword, $lrn);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Account created successfully. Please wait for admin validation."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create account."]);
}

$conn->close();
?>