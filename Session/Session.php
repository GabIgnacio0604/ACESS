<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Regenerate session ID periodically
if (!isset($_SESSION['created'])) {
    $_SESSION['created'] = time();
} else if (time() - $_SESSION['created'] > 1800) {
    // Session started more than 30 minutes ago
    session_regenerate_id(true);
    $_SESSION['created'] = time();
}

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['fullname'])) {
    
    // Check session timestamp 
    if (isset($_SESSION['last_activity'])) {
        $inactive_time = 15 * 60; // 15 minutes in seconds
        
        if (time() - $_SESSION['last_activity'] > $inactive_time) {
            // Session expired due to inactivity
            session_unset();
            session_destroy();
            
            echo json_encode([
                'valid' => false,
                'reason' => 'timeout'
            ]);
            exit;
        }
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    
    echo json_encode([
        'valid' => true,
        'user_id' => $_SESSION['user_id'],
        'fullname' => $_SESSION['fullname'],
        'role' => $_SESSION['role'] ?? 'user'
    ]);
} else {
    // Session is invalid
    echo json_encode([
        'valid' => false,
        'reason' => 'no_session'
    ]);
}
?>