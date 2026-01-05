<?php
// Include database connection
require_once __DIR__ . '/../../Accounts/db_connection.php';

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if ID is provided
if (!isset($data['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Club ID is required']);
    exit;
}

$clubId = $data['id'];

try {
    // Start transaction
    $conn->begin_transaction();

    // Delete the club
    $stmt = $conn->prepare("DELETE FROM clubs WHERE id = ?");
    $stmt->bind_param("i", $clubId);
    
    if ($stmt->execute()) {
        // If deletion is successful, commit the transaction
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Club deleted successfully']);
    } else {
        // If there's an error, rollback the transaction
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete club']);
    }
    
    $stmt->close();
} catch (Exception $e) {
    // If there's any exception, rollback the transaction
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
}

// Close the connection
$conn->close();
?>
