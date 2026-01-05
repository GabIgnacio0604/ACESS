<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../../Accounts/db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$currentUserId = $_SESSION['user_id'];
$currentUserRole = $_SESSION['role'];
$isStudent = $currentUserRole == "user";
$isTeacher = $currentUserRole == "teacher";
$isStudentCouncil = $currentUserRole == "studentcouncil";

// Only allow admin, teacher, and studentcouncil
$allowedRoles = ['admin', 'teacher', 'studentcouncil'];
// if (!in_array(strtolower($currentUserRole), $allowedRoles)) {
//     echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
//     exit;
// }

try {
    $contacts = [];
    
    if(!$isStudent) {
        // Get all users with allowed roles (except current user)
        $query = "SELECT id, fullname, email, role FROM users 
                WHERE role IN ('admin', 'teacher', 'studentcouncil') 
                AND id != ? 
                AND status = 'active'
                ORDER BY fullname ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $currentUserId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $contacts[] = [
                'id' => $row['id'],
                'fullname' => $row['fullname'],
                'email' => $row['email'],
                'role' => $row['role'],
                'type' => 'direct'
            ];
        }    
    }
    
    // Get clubs that the user is a member of (for club group chats)
    // If user is a teacher, show clubs where they are the adviser
    // Otherwise, show clubs where they are an approved member
    if (strtolower($currentUserRole) === 'teacher') {
        $clubQuery = "SELECT DISTINCT c.id, c.club_name 
                      FROM clubs c
                      WHERE c.adviser = ?
                      ORDER BY c.club_name ASC";
    } else {
        $clubQuery = "SELECT DISTINCT c.id, c.club_name 
                      FROM clubs c
                      INNER JOIN club_members cm ON c.id = cm.club_id
                      WHERE cm.user_id = ? AND cm.approved_at IS NOT NULL
                      ORDER BY c.club_name ASC";
    }

    $stmt = $conn->prepare($clubQuery);
    $stmt->bind_param("i", $currentUserId);
    $stmt->execute();
    $clubResult = $stmt->get_result();
    
    while ($row = $clubResult->fetch_assoc()) {
        $contacts[] = [
            'id' => $row['id'],
            'fullname' => $row['club_name'] . ' (Group)',
            'type' => 'club'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'contacts' => $contacts
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>