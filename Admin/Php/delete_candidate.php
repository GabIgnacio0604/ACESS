<?php
require_once '../../Accounts/db_connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('Candidate ID is required');
    }

    $id = $data['id'];

    // Delete from voting_candidates table
    $query = "DELETE FROM voting_candidates WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        // Get updated list of candidates
        $query = "SELECT * FROM voting_candidates ORDER BY position, candidate_name";
        $result = $conn->query($query);
        $candidates = [];
        
        while ($row = $result->fetch_assoc()) {
            $candidates[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Candidate deleted successfully',
            'candidates' => $candidates
        ]);
    } else {
        throw new Exception('Failed to delete candidate');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>