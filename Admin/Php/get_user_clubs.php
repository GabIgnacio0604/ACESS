<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

// Initialize session
$user_id = $_SESSION['user_id'];

if (!$user_id) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in',
        'clubs' => []
    ]);
    exit;
}

try {
    // Query to get all clubs the user is a member of
    // Joining with clubs table to get club details
    $query = "SELECT *
              FROM club_members cm
              JOIN clubs c ON cm.club_id = c.id
              WHERE cm.user_id = ?";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $clubs = [];
    while ($row = $result->fetch_assoc()) {
        $clubs[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Clubs retrieved successfully',
        'clubs' => $clubs
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'clubs' => []
    ]);
}

$conn->close();