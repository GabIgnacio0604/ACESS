<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

try {
    $query = "SELECT * FROM voting_candidates ORDER BY 
        CASE position 
            WHEN 'President' THEN 1
            WHEN 'Vice President' THEN 2
            WHEN 'Secretary' THEN 3
            WHEN 'Treasurer' THEN 4
            WHEN 'Auditor' THEN 5
            WHEN 'P.I.O' THEN 6
            WHEN 'P.O' THEN 7
            WHEN 'Grade 12' THEN 8
            WHEN 'Grade 11' THEN 9
            WHEN 'Grade 10' THEN 10
            WHEN 'Grade 9' THEN 11
            WHEN 'Grade 8' THEN 12
            WHEN 'Grade 7' THEN 13
            ELSE 14
        END";
    
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