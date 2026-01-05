<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../Accounts/db_connection.php';

$events = [];
$announcements = [];

$result = $conn->query("SELECT * FROM events ORDER BY date ASC");
while ($row = $result->fetch_assoc()) {
  $events[] = $row;
}

$result = $conn->query("SELECT * FROM club_announcements ORDER BY date ASC");
while ($row = $result->fetch_assoc()) {
  $announcements[] = $row;
}

echo json_encode([
  "events" => $events,
  "announcements" => $announcements
]);

$conn->close();
?>
