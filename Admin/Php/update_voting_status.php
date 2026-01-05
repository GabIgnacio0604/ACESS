<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

try {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input['voting_active'])) {
        throw new Exception('Voting status is required');
    }
    
    $votingActive = $input['voting_active'] ? 1 : 0;
    $votingYear = $input['voting_year'] ? $input['voting_year'] : null;

    if(!$votingActive){
        // Update or insert voting status
        $query = "INSERT INTO voting_settings (id, voting_active) VALUES (1, ?) 
                ON DUPLICATE KEY UPDATE voting_active = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $votingActive, $votingActive);
    }else{
        // Update or insert voting status
        $query = "INSERT INTO voting_settings (id, voting_active, voting_year) VALUES (1, ?, ?) 
                ON DUPLICATE KEY UPDATE voting_active = ?, voting_year = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iiii", $votingActive, $votingYear, $votingActive, $votingYear);        
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Voting status updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update voting status');
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