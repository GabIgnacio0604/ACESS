<?php
// File: Admin/Php/update_club_membership.php (Updated version)
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../../Accounts/db_connection.php';

// Check if user is logged in and is a teacher/admin
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$currentUserRole = $_SESSION['role'];
$allowedRoles = ['admin', 'teacher'];

if (!in_array(strtolower($currentUserRole), $allowedRoles)) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Get the JSON payload
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['member_id']) || !isset($data['action'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Member ID and action are required'
    ]);
    exit;
}

$member_id = $data['member_id'];
$action = $data['action'];

try {
    // Get member and club information before action
    $infoQuery = "SELECT cm.club_id, cm.user_id, u.fullname, c.club_name 
                  FROM club_members cm
                  JOIN users u ON cm.user_id = u.id
                  JOIN clubs c ON cm.club_id = c.id
                  WHERE cm.user_id = ?";
    $infoStmt = $conn->prepare($infoQuery);
    $infoStmt->bind_param("i", $member_id);
    $infoStmt->execute();
    $infoResult = $infoStmt->get_result();
    $memberInfo = $infoResult->fetch_assoc();
    
    if (!$memberInfo) {
        throw new Exception("Member not found");
    }
    
    $conn->begin_transaction();
    
    switch ($action) {
        case 'accept':
            // Approve the member
            $query = "UPDATE club_members SET approved_at = NOW() WHERE user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $member_id);
            
            if ($stmt->execute()) {
                // Send welcome message to club group chat
                $adminId = $_SESSION['user_id'];
                $welcomeMsg = "{$memberInfo['fullname']} has joined the club!";
                
                $msgStmt = $conn->prepare("INSERT INTO messages (sender_id, club_id, message, message_type) VALUES (?, ?, ?, 'club')");
                $msgStmt->bind_param("iis", $adminId, $memberInfo['club_id'], $welcomeMsg);
                $msgStmt->execute();
                $msgStmt->close();
            }
            break;
            
        case 'reject':
        case 'remove':
            // Delete the membership
            $query = "DELETE FROM club_members WHERE user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $member_id);
            
            if ($action === 'remove' && $stmt->execute()) {
                // Send removal notification to group chat
                $adminId = $_SESSION['user_id'];
                $removeMsg = "{$memberInfo['fullname']} has left the club.";
                
                $msgStmt = $conn->prepare("INSERT INTO messages (sender_id, club_id, message, message_type) VALUES (?, ?, ?, 'club')");
                $msgStmt->bind_param("iis", $adminId, $memberInfo['club_id'], $removeMsg);
                $msgStmt->execute();
                $msgStmt->close();
            }
            break;
            
        default:
            throw new Exception("Invalid action");
    }
    
    if ($stmt->execute()) {
        $conn->commit();
        
        $messages = [
            'accept' => 'Member approved and added to group chat',
            'reject' => 'Membership request rejected',
            'remove' => 'Member removed from club and group chat'
        ];
        
        echo json_encode([
            'success' => true,
            'message' => $messages[$action]
        ]);
    } else {
        throw new Exception("Failed to update membership");
    }

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>