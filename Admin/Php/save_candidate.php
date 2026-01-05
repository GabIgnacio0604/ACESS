<?php
require_once '../../Accounts/db_connection.php';

header('Content-Type: application/json');

function uploadPhoto($file, $id, $conn) {
    $baseDir = 'Images/candidates';
    if (!is_dir($baseDir)) {
        mkdir($baseDir, 0777, true);
    }
    $uploadDir = __DIR__ . '/../../' . $baseDir;
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'candidate_' . time() . '.' . $ext; 
    $destination = $uploadDir . '/' . $filename;
    $moved = (move_uploaded_file($file['tmp_name'], $destination));
    $uploadURL = $baseDir . '/' . $filename;

    $query = "UPDATE voting_candidates SET photo_url = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $uploadURL, $id);
    $stmt->execute();
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

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $data = [
        'name' => isset($_POST['name']) ? $_POST['name'] : null,
        'position' => isset($_POST['position']) ? $_POST['position'] : null,
        'id' => isset($_POST['id']) ? $_POST['id'] : null,
    ];

    if (!isset($data['name']) || !isset($data['position'])) {
        throw new Exception('Name and position are required');
    }

    $file = isset($_FILES['candidatePhoto']) ? $_FILES['candidatePhoto'] : null;
    $name = $data['name'];
    $position = $data['position'];
    $id = isset($data['id']) ? $data['id'] : null;

    // Insert into voting_candidates table


    
    if(!empty($id)) {
        $query = "UPDATE voting_candidates SET candidate_name = ?, position = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $d = $stmt->bind_param("ssi", $name, $position, $id);
    }else {
        $year = votingYear($conn);
        $query = "INSERT INTO voting_candidates (candidate_name, position, year) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssi", $name, $position, $year);
    }

    $success = $stmt->execute();
    
    $uploadCandidateId = null;

    if(empty($id)) {
        $uploadCandidateId = $stmt->insert_id;
    }else{
        $uploadCandidateId = $id;
    }

    if($file) {
        uploadPhoto($file, $uploadCandidateId, $conn);
    }
    
    if ($success) {
        // Get all candidates after insertion
        $query = "SELECT * FROM voting_candidates ORDER BY position, candidate_name";
        $result = $conn->query($query);
        $candidates = [];
        
        while ($row = $result->fetch_assoc()) {
            $candidates[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Candidate added successfully',
            'candidates' => $candidates
        ]);
    } else {
        throw new Exception('Failed to add candidate');
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