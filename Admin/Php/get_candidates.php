<?php
require_once '../../Accounts/db_connection.php';

header('Content-Type: application/json');

try {
    $query = "SELECT * FROM voting_candidates ORDER BY position, candidate_name";
    $result = $conn->query($query);
    
    if ($result) {
        $candidates = [];
        while ($row = $result->fetch_assoc()) {
            $candidates[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'candidates' => $candidates
        ]);
    } else {
        throw new Exception('Failed to fetch candidates');
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