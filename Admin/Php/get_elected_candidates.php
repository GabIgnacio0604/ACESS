<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

function getVotingSettings($conn) {

    $query = "SELECT * FROM voting_settings WHERE id = 1 LIMIT 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $data = $result->fetch_assoc();

        return [
            'id' => $data['id'],
            'voting_active' => (bool)$data['voting_active'],
            'last_updated' => $data['last_updated'],
            'voting_year' => $data['voting_year']
        ];
    } else {
        throw new Exception('No voting settings found');
    }
}

function byYear($conn, $year) {
    // Get the candidate with highest votes for each position
    $query = "SELECT vc1.id, 
                vc1.candidate_name, 
                vc1.position,
                vc1.year,
                (SELECT COUNT(*) FROM votes WHERE candidate_id = vc1.id) as votes
            FROM voting_candidates vc1
            WHERE vc1.year = ".$year."
            ORDER BY 
                CASE vc1.position 
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
        $elected = [];
        $executive = [];
        $grades = [];
        $positions = [];
        $positionGroups = [];
        
        while ($row = $result->fetch_assoc()) {
            $candidate = [
                'id' => $row['id'],
                'name' => $row['candidate_name'],
                'votes' => $row['votes']
            ];
            
            // Group candidates by position
            if (!isset($positionGroups[$row['position']])) {
                $positionGroups[$row['position']] = [
                    'position' => $row['position'],
                    'candidates' => []
                ];
            }
            $positionGroups[$row['position']]['candidates'][] = $candidate;

            // Keep existing grouping logic for backward compatibility
            $candidateWithPosition = $candidate;
            $candidateWithPosition['position'] = $row['position'];
            
            if (in_array($row['position'], ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'P.I.O', 'P.O'])) {
                $executive[] = $candidateWithPosition;
            } else {
                $grades[] = $candidateWithPosition;
            }
            
            $elected[$row['position']] = $candidateWithPosition;
        }

        // Convert position groups to array and sort them
        $positionOrder = [
            'President' => 1,
            'Vice President' => 2,
            'Secretary' => 3,
            'Treasurer' => 4,
            'Auditor' => 5,
            'P.I.O' => 6,
            'P.O' => 7,
            'Grade 12' => 8,
            'Grade 11' => 9,
            'Grade 10' => 10,
            'Grade 9' => 11,
            'Grade 8' => 12,
            'Grade 7' => 13
        ];

        $positions = array_values($positionGroups);
        usort($positions, function($a, $b) use ($positionOrder) {
            $orderA = $positionOrder[$a['position']] ?? 999;
            $orderB = $positionOrder[$b['position']] ?? 999;
            return $orderA - $orderB;
        });
        
        return [
            'elected' => $elected,
            'executive' => $executive,
            'grades' => $grades,
            'positions' => $positions
        ];
    } else {
        throw new Exception('Failed to fetch elected candidates');
    }   
}

try {
    echo json_encode(array_merge(
        [
            'success' => true,
            'voting_active' => (bool)getVotingSettings($conn)['voting_active']
        ],
        byYear($conn, getVotingSettings($conn)['voting_year']),
        [
            'previous_year' => byYear($conn, getVotingSettings($conn)['voting_year'] - 1)
        ]
    ));
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>