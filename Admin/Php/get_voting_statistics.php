<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

try {
    $query = "SELECT position, candidate_name, votes FROM voting_candidates ORDER BY position, votes DESC";
    $result = $conn->query($query);
    
    if ($result) {
        $stats = [];
        while ($row = $result->fetch_assoc()) {
            $position = $row['position'];
            if (!isset($stats[$position])) {
                $stats[$position] = [];
            }
            $stats[$position][] = [
                'candidate_name' => $row['candidate_name'],
                'votes' => $row['votes']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
    } else {
        throw new Exception('Failed to fetch statistics');
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