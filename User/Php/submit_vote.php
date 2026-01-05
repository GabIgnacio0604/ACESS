<?php
session_start();
header('Content-Type: application/json');

require_once '../../Accounts/db_connection.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please log in to vote']);
    exit;
}

function votingYear($conn) {
    $voting_query = "SELECT * FROM voting_settings WHERE id = 1";
    $voting_result = $conn->query($voting_query);
    
    if ($voting_result && $voting_result->num_rows > 0) {
        $row = $voting_result->fetch_assoc();
        
        return $row['voting_year'];
    }
    
    return null;
}

$user_id = $_SESSION['user_id'];

// Check if voting is active
$check_voting = $conn->query("SELECT voting_active FROM voting_settings WHERE id = 1");
$voting_status = $check_voting->fetch_assoc();
$votingYear = votingYear($conn);

if (!$voting_status || !$voting_status['voting_active']) {
    echo json_encode(['success' => false, 'message' => 'Voting is currently not active']);
    exit;
}

// Check if user already voted
$check_vote = $conn->prepare("SELECT id FROM votes WHERE user_id = ? AND year = ?");
$check_vote->bind_param("ii", $user_id, $votingYear);
$check_vote->execute();
$already_voted = $check_vote->get_result();

if ($already_voted->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'You have already voted']);
    exit;
}

// Get vote data
$input = json_decode(file_get_contents("php://input"), true);

// Normalize input — support both {votes:{...}} and {...}
$votes = [];
if (isset($input['votes']) && is_array($input['votes'])) {
    $votes = $input['votes'];
} elseif (is_array($input)) {
    $votes = $input;
}

// Validate
if (empty($votes)) {
    echo json_encode(['success' => false, 'message' => 'No votes received']);
    exit;
}
    

// Start transaction
$conn->begin_transaction();

try {
    // Record votes for each position
    foreach ($votes as $position => $candidate_id) {
        // Verify the candidate exists and belongs to the correct position
        $verify_candidate = $conn->prepare("SELECT id FROM voting_candidates WHERE id = ?");
        $verify_candidate->bind_param("i", $candidate_id);
        $verify_candidate->execute();
        $result = $verify_candidate->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Invalid candidate selected for position: " . $position);
        }

        // Record the vote
        $record_vote = $conn->prepare("INSERT INTO votes (user_id, candidate_id, year) VALUES (?, ?, ?)");
        $record_vote->bind_param("iii", $user_id, $candidate_id, $votingYear);
        $record_vote->execute();
    }

    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Your vote has been submitted successfully!'
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to submit vote: ' . $e->getMessage()
    ]);
}

$conn->close();
?>