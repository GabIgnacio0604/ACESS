<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "u465284186_ACESS";
$pass = "Acess12345";
$db   = "u465284186_ACESS";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$sender_email = $input['sender_email'] ?? '';
$receiver_email = $input['receiver_email'] ?? '';
$message = trim($input['message'] ?? '');

if (!$sender_email || !$receiver_email || !$message) {
    echo json_encode(["success" => false, "message" => "Missing data"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO messages (sender_email, receiver_email, message) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $sender_email, $receiver_email, $message);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to send"]);
}

$stmt->close();
$conn->close();
?>
