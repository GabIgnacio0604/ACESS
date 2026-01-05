<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../../Accounts/db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$currentUserId = $_SESSION['user_id'];
$input = json_decode(file_get_contents("php://input"), true);

$contactType = $input['type'] ?? 'direct';
$contactId = $input['contact_id'] ?? null;

if (!$contactId) {
    echo json_encode(['success' => false, 'message' => 'Contact ID required']);
    exit;
}

try {
    $messages = [];
    
    if ($contactType === 'direct') {
        // Get direct messages between two users
        $query = "SELECT m.*, 
                  sender.fullname as sender_name,
                  receiver.fullname as receiver_name
                  FROM messages m
                  LEFT JOIN users sender ON m.sender_id = sender.id
                  LEFT JOIN users receiver ON m.receiver_id = receiver.id
                  WHERE m.message_type = 'direct'
                  AND ((m.sender_id = ? AND m.receiver_id = ?)
                       OR (m.sender_id = ? AND m.receiver_id = ?))
                  ORDER BY m.timestamp ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iiii", $currentUserId, $contactId, $contactId, $currentUserId);
        
    } else if ($contactType === 'club') {
        // Get club group messages
        $query = "SELECT m.*, 
                  u.fullname as sender_name
                  FROM messages m
                  INNER JOIN users u ON m.sender_id = u.id
                  WHERE m.message_type = 'club'
                  AND m.club_id = ?
                  ORDER BY m.timestamp ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $contactId);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            'id' => $row['id'],
            'sender_id' => $row['sender_id'],
            'sender_name' => $row['sender_name'],
            'message' => $row['message'],
            'timestamp' => $row['timestamp'],
            'is_own' => ($row['sender_id'] == $currentUserId)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>