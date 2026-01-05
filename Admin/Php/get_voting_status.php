<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

try {
    // Create voting_settings table if it doesn't exist
    $createTable = "CREATE TABLE IF NOT EXISTS voting_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        voting_active BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->query($createTable);
    
    // Get current voting status
    $query = "SELECT voting_active, last_updated FROM voting_settings LIMIT 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'voting_active' => (bool)$row['voting_active'],
            'last_updated' => $row['last_updated']
        ]);
    } else {
        // Insert default record if none exists
        $conn->query("INSERT INTO voting_settings (voting_active) VALUES (FALSE)");
        echo json_encode([
            'success' => true,
            'voting_active' => false,
            'last_updated' => date('Y-m-d H:i:s')
        ]);
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