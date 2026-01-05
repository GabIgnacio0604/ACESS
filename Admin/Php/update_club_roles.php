<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../../Accounts/db_connection.php';

// Check authorization (only advisors/admins can update roles)
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['admin', 'teacher'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$club_id = $data['club_id'] ?? null;
$president_id = $data['president_id'] ?? null;
$vice_president_id = $data['vice_president_id'] ?? null;
$description = $data['description'] ?? null;

if (!$club_id) {
    echo json_encode(['success' => false, 'message' => 'Club ID required']);
    exit;
}

try {
    $conn->begin_transaction();

    // Update description if provided
    if ($description !== null) {
        $desc_query = "UPDATE clubs SET description = ? WHERE id = ?";
        $stmt = $conn->prepare($desc_query);
        $stmt->bind_param("si", $description, $club_id);
        $stmt->execute();
    }

    // Reset all roles to 'member' for this club
    $reset_query = "UPDATE club_members 
                   SET role = 'member' 
                   WHERE club_id = ? AND role IN ('president', 'vice_president')";
    $stmt = $conn->prepare($reset_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();

    // Set new president
    if ($president_id) {
        $pres_query = "UPDATE club_members 
                      SET role = 'president' 
                      WHERE club_id = ? AND user_id = ?";
        $stmt = $conn->prepare($pres_query);
        $stmt->bind_param("ii", $club_id, $president_id);
        $stmt->execute();
    }

    // Set new vice president
    if ($vice_president_id) {
        $vp_query = "UPDATE club_members 
                    SET role = 'vice_president' 
                    WHERE club_id = ? AND user_id = ?";
        $stmt = $conn->prepare($vp_query);
        $stmt->bind_param("ii", $club_id, $vice_president_id);
        $stmt->execute();
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Club roles updated successfully'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>