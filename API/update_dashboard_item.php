<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../Accounts/db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['type'] ?? '';
$action = $data['action'] ?? '';
$date = $data['date'] ?? '';
$title = $data['title'] ?? '';
$id = $data['id'] ?? '';

// Determine table based on type
if ($type === 'event') {
  $table = 'events';
} elseif ($type === 'announcement') {
  $table = 'club_announcements';
} else {
  echo json_encode(["success" => false, "message" => "Invalid type"]);
  exit;
}

if ($action === 'add') {
  $stmt = $conn->prepare("INSERT INTO $table (date, title) VALUES (?, ?)");
  $stmt->bind_param("ss", $date, $title);
  $stmt->execute();
  echo json_encode(["success" => true]);
} elseif ($action === 'delete' && $id) {
  $stmt = $conn->prepare("DELETE FROM $table WHERE id=?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => "Invalid action or data"]);
}

$conn->close();
?>
