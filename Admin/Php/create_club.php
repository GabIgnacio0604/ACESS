<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../../Accounts/db_connection.php';

// Ensure admin session
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['club_name']) || empty($input['adviser']) || empty($input['group_chat'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$club_name = trim($input['club_name']);
$adviser = trim($input['adviser']);
$group_chat = trim($input['group_chat']);

$conn->begin_transaction();

try {
    // Prevent duplicate club names
    $check = $conn->prepare("SELECT id FROM clubs WHERE club_name = ?");
    $check->bind_param("s", $club_name);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        throw new Exception("A club with this name already exists.");
    }
    $check->close();

    // Insert club
    $stmt = $conn->prepare("INSERT INTO clubs (club_name, adviser, group_chat, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sss", $club_name, $adviser, $group_chat);
    $stmt->execute();
    $clubId = $stmt->insert_id;
    $stmt->close();

    // Find adviser in users
    $adviserStmt = $conn->prepare("SELECT id FROM users WHERE fullname = ? AND role = 'teacher' LIMIT 1");
    $adviserStmt->bind_param("s", $adviser);
    $adviserStmt->execute();
    $result = $adviserStmt->get_result();
    $adviserStmt->close();

    if ($result->num_rows > 0) {
        $adviserData = $result->fetch_assoc();
        $adviserId = $adviserData['id'];

        $memberStmt = $conn->prepare("
            INSERT INTO club_members (club_id, user_id, role, approved_at)
            VALUES (?, ?, 'advisor', NOW())
        ");
        $memberStmt->bind_param("ii", $clubId, $adviserId);
        $memberStmt->execute();
        $memberStmt->close();
    }

    // Add welcome message
    $adminId = $_SESSION['user_id'];
    $welcome = "Welcome to $club_name! This is the official group chat.";
 $msgStmt = $conn->prepare("
    INSERT INTO messages (sender_id, club_id, message, message_type)
    VALUES (?, ?, ?, 'club')
");

    $msgStmt->bind_param("iis", $adminId, $clubId, $welcome);
    $msgStmt->execute();
    $msgStmt->close();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Club created successfully!', 'club_id' => $clubId]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
