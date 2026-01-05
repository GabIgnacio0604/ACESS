<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../../Accounts/db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

function getClubByid($conn, $clubId) {
    $query = "SELECT * FROM clubs WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $clubId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

$currentUserId = $_SESSION['user_id'];
$input = json_decode(file_get_contents("php://input"), true);

$messageType = $input['type'] ?? 'direct';
$contactId = $input['contact_id'] ?? null;
$message = trim($input['message'] ?? '');

if (!$contactId || !$message) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    if ($messageType === 'direct') {
        // Send direct message
        $query = "INSERT INTO messages (sender_id, receiver_id, message, message_type) 
                  VALUES (?, ?, ?, 'direct')";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iis", $currentUserId, $contactId, $message);
        
    } else if ($messageType === 'club') {
        $club = getClubByid($conn, $contactId);
        // Verify user is a member of the club
        $verifyQuery = "SELECT id FROM club_members 
                        WHERE club_id = ? AND user_id = ? AND approved_at IS NOT NULL";
        $verifyStmt = $conn->prepare($verifyQuery);
        $verifyStmt->bind_param("ii", $contactId, $currentUserId);
        $verifyStmt->execute();
        $verifyResult = $verifyStmt->get_result();
        $isAdvisor = $currentUserId == $club['adviser'];
        
        if ($verifyResult->num_rows === 0 && !$isAdvisor) {
            echo json_encode(['success' => false, 'message' => 'Not a member of this club']);
            exit;
        }
        
        // Send club message
        $query = "INSERT INTO messages (sender_id, club_id, message, message_type) 
                  VALUES (?, ?, ?, 'club')";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iis", $currentUserId, $contactId, $message);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message_id' => $stmt->insert_id
        ]);
    } else {
        throw new Exception('Failed to send message');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>