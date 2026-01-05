<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $_SESSION['user_id'];

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

if (empty($data['club_id'])) {
    echo json_encode(['success' => false, 'message' => 'Club ID is required']);
    exit;
}

if (empty($data['action']) || !in_array($data['action'], ['join', 'cancel'])) {
    echo json_encode(['success' => false, 'message' => 'Action must be "join" or "cancel"']);
    exit;
}

$club_id = $data['club_id'];
$action = $data['action'];

try {
    // Check if user is already a member or adviser
    $stmt = $conn->prepare("SELECT role FROM club_members WHERE user_id = ? AND club_id = ?");
    $stmt->bind_param("ii", $user_id, $club_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $existing = $result->fetch_assoc();
    $stmt->close();

    $isMember = $existing !== null;

    if ($action === 'join') {
        if ($isMember) {
            // If adviser, prevent joining as regular member
            if ($existing['role'] === 'advisor') {
                echo json_encode(['success' => false, 'message' => 'You are the adviser of this club and cannot join as a member.']);
                exit;
            }

            echo json_encode(['success' => false, 'message' => 'You are already a member of this club.']);
            exit;
        }

        // Insert new membership with pending approval
        $stmt = $conn->prepare("
            INSERT INTO club_members (user_id, club_id, status, approved_at) 
            VALUES (?, ?, 'pending', NULL)
        ");
        $stmt->bind_param("ii", $user_id, $club_id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Successfully requested to join the club. Wait for adviser approval.'
            ]);
        } else {
            throw new Exception('Failed to request to join club.');
        }
        $stmt->close();

    } else if ($action === 'cancel') {
        if (!$isMember) {
            echo json_encode(['success' => false, 'message' => 'You are not a member of this club.']);
            exit;
        }

        // Advisers cannot cancel themselves
        if ($existing['role'] === 'advisor') {
            echo json_encode(['success' => false, 'message' => 'Adviser cannot leave their own club.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM club_members WHERE user_id = ? AND club_id = ?");
        $stmt->bind_param("ii", $user_id, $club_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Successfully left the club and group chat.']);
        } else {
            throw new Exception('Failed to leave club.');
        }
        $stmt->close();
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>
