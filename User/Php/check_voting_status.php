<?php
session_start();
header('Content-Type: application/json');

require_once '../../Accounts/db_connection.php';

function votingYear($conn) {
    $voting_query = "SELECT * FROM voting_settings WHERE id = 1";
    $voting_result = $conn->query($voting_query);
    
    if ($voting_result && $voting_result->num_rows > 0) {
        $row = $voting_result->fetch_assoc();
        
        return $row['voting_year'];
    }
    
    return null;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$votingYear = votingYear($conn);

try {
    // Check if voting is active
    $voting_query = "SELECT voting_active FROM voting_settings WHERE id = 1";
    $voting_result = $conn->query($voting_query);
    $voting_active = false;
    
    if ($voting_result && $voting_result->num_rows > 0) {
        $row = $voting_result->fetch_assoc();
        $voting_active = (bool)$row['voting_active'];
    }
    
    // Check if user has already voted
    $check_vote = $conn->prepare("SELECT voting_candidates.id FROM voting_candidates LEFT JOIN votes ON voting_candidates.id = votes.candidate_id WHERE votes.user_id = ? AND voting_candidates.year = ? AND votes.year = ?");
    $check_vote->bind_param("iii", $user_id, $votingYear, $votingYear);
    $check_vote->execute();
    $already_voted = $check_vote->get_result()->num_rows > 0;
    
    echo json_encode([
        'success' => true,
        'voting_active' => $voting_active,
        'already_voted' => $already_voted,
        'voting_year' => $votingYear
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>