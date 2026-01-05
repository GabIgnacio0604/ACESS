<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

// Only advisers/teachers should be allowed here
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'adviser') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['member_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing member ID'
    ]);
    exit;
}

$member_id = intval($data['member_id']);

try {
    $query = "UPDATE club_members 
              SET approved_at = NOW() 
              WHERE id = ? AND approved_at IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $member_id);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Member approved successfully.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Member already approved or not found.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
