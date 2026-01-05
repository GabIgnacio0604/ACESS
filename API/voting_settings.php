<?php
header('Content-Type: application/json');
require_once '../Accounts/db_connection.php';

try {
    $query = "SELECT id, voting_active, last_updated FROM voting_settings WHERE id = 1 LIMIT 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $settings = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $settings['id'],
                'voting_active' => (bool)$settings['voting_active'],
                'last_updated' => $settings['last_updated']
            ]
        ]);
    } else {
        throw new Exception('No voting settings found');
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
