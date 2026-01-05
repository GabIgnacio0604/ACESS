<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../Accounts/db_connection.php';

$club_id = $_GET['club_id'] ?? null;

if (!$club_id) {
    echo json_encode(['success' => false, 'message' => 'Club ID required']);
    exit;
}

try {
    // Get club basic info
    $club_query = "SELECT club_name, adviser, description FROM clubs WHERE id = ?";
    $stmt = $conn->prepare($club_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $club_result = $stmt->get_result();
    $club = $club_result->fetch_assoc();

    if (!$club) {
        throw new Exception('Club not found');
    }

    // Get president and vice president in one query
    $officers_query = "SELECT u.id, u.fullname, cm.role 
                      FROM club_members cm 
                      JOIN users u ON cm.user_id = u.id 
                      WHERE cm.club_id = ? 
                      AND cm.role IN ('president', 'vice_president')";
    $stmt = $conn->prepare($officers_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $officers_result = $stmt->get_result();
    
    $president = null;
    $vp = null;
    while ($officer = $officers_result->fetch_assoc()) {
        if ($officer['role'] === 'president') {
            $president = $officer;
        } elseif ($officer['role'] === 'vice_president') {
            $vp = $officer;
        }
    }

    // Get all members
    $members_query = "SELECT u.id, u.fullname, u.email, cm.role, cm.approved_at 
                     FROM club_members cm 
                     JOIN users u ON cm.user_id = u.id 
                     WHERE cm.club_id = ? 
                     ORDER BY 
                        CASE cm.role 
                            WHEN 'president' THEN 1 
                            WHEN 'vice_president' THEN 2 
                            WHEN 'advisor' THEN 3 
                            ELSE 4 
                        END, 
                        u.fullname";
    $stmt = $conn->prepare($members_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $members_result = $stmt->get_result();
    
    $members = [];
    while ($row = $members_result->fetch_assoc()) {
        $members[] = $row;
    }

    echo json_encode([
        'success' => true,
        'club' => $club,
        'president' => $president ? $president['fullname'] : 'Not assigned',
        'vice_president' => $vp ? $vp['fullname'] : 'Not assigned',
        'members' => $members
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>