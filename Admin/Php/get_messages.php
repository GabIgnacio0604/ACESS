<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$db   = "acess"; 

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$user_email = $input['user_email'] ?? '';
$contact_email = $input['contact_email'] ?? '';

if (!$user_email || !$contact_email) {
    echo json_encode(["success" => false, "message" => "Missing emails"]);
    exit;
}

$query = "SELECT * FROM messages 
          WHERE (sender_email=? AND receiver_email=?) 
             OR (sender_email=? AND receiver_email=?)
          ORDER BY timestamp ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("ssss", $user_email, $contact_email, $contact_email, $user_email);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode(["success" => true, "messages" => $messages]);

$stmt->close();
$conn->close();
?>
