<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../Accounts/db_connection.php';

// Get input
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["id"], $input["type"])) {
  echo json_encode(["success" => false, "error" => "Missing parameters"]);
  exit;
}

$id = intval($input["id"]);
$type = $input["type"];

// Validate type and choose correct table
$table = ($type === "event") ? "events" : (($type === "announcement") ? "club_announcements" : null);

if (!$table) {
  echo json_encode(["success" => false, "error" => "Invalid type"]);
  exit;
}

// Validate ID
if ($id <= 0) {
  echo json_encode(["success" => false, "error" => "Invalid ID"]);
  exit;
}

try {
  // Delete item (prepared statement to prevent SQL injection)
  $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
  $stmt->bind_param("i", $id);
  
  if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
      echo json_encode([
        "success" => true, 
        "message" => ucfirst($type) . " deleted successfully"
      ]);
    } else {
      echo json_encode(["success" => false, "error" => ucfirst($type) . " not found"]);
    }
  } else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
  }
  
  $stmt->close();
} catch (Exception $e) {
  echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>