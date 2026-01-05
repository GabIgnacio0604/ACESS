<?php
require_once '../Accounts/db_connection.php';

header('Content-Type: application/json');

try {
    // Get candidates grouped by position with custom ordering
    $query = "SELECT * FROM voting_candidates ORDER BY 
        CASE position 
            WHEN 'President' THEN 1
            WHEN 'Vice President' THEN 2
            WHEN 'Secretary' THEN 3
            WHEN 'Auditor' THEN 4
            WHEN 'P.I.O' THEN 5
            WHEN 'P.O' THEN 6
            WHEN 'Grade 12 Representative' THEN 7
            WHEN 'Grade 11 Representative' THEN 8
            WHEN 'Grade 10 Representative' THEN 9
            WHEN 'Grade 9 Representative' THEN 10
            WHEN 'Grade 8 Representative' THEN 11
            WHEN 'Grade 7 Representative' THEN 12
            ELSE 13
        END,
        candidate_name";
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
