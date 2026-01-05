<?php
require_once '../Accounts/db_connection.php';

header('Content-Type: application/json');

try {
    // Get candidates grouped by position
    $query = "SELECT * FROM voting_candidates ORDER BY position, candidate_name";
    $result = $conn->query($query);
    
    if ($result) {
        $candidates = [];
        while ($row = $result->fetch_assoc()) {
            $position = $row['position'];
            if (!isset($candidates[$position])) {
                $candidates[$position] = [];
            }
            $candidates[$position][] = [
                'id' => $row['id'],
                'name' => $row['candidate_name']
            ];
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