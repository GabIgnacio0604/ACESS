<?php
header('Content-Type: application/json');
require_once '../Accounts/db_connection.php';

function votingYear($conn) {
    $voting_query = "SELECT * FROM voting_settings WHERE id = 1";
    $voting_result = $conn->query($voting_query);
    
    if ($voting_result && $voting_result->num_rows > 0) {
        $row = $voting_result->fetch_assoc();
        
        return $row['voting_year'];
    }
    
    return null;
}

$forCurrentVoteYear = isset($_GET['for-current-vote-year']) ? $_GET['for-current-vote-year'] : null;

try {
    // Get candidates with photos, grouped by position with custom ordering
    $where = '';

    if($forCurrentVoteYear) {
        $where = ' WHERE vc.year = ' . votingYear($conn);
    }

    $query = "SELECT vc.*, 
       (SELECT COUNT(*) FROM votes WHERE candidate_id = vc.id) as votes
        FROM voting_candidates vc
        " . $where . "
        ORDER BY 
            CASE vc.position 
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
            END,
            vc.candidate_name";
    
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
                'name' => $row['candidate_name'],
                'votes' => $row['votes'],
                'photo_url' => !empty($row['photo_url']) ?  '/' . $row['photo_url'] : null
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