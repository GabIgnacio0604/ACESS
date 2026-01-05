<?php
header('Content-Type: application/json');
require_once '../../Accounts/db_connection.php';

try {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create') {
        $candidateName = $_POST['candidate_name'] ?? '';
        $position = $_POST['position'] ?? '';
        
        if (empty($candidateName) || empty($position)) {
            throw new Exception('Candidate name and position are required');
        }
        
        // Handle photo upload
        $photoUrl = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../Images/Candidates/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $filename = 'candidate_' . time() . '.' . $ext;
            $destination = $uploadDir . $filename;
            
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $destination)) {
                $photoUrl = '../Images/Candidates/' . $filename;
            }
        }
        
        $query = "INSERT INTO voting_candidates (candidate_name, position, photo_url, votes) VALUES (?, ?, ?, 0)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $candidateName, $position, $photoUrl);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Candidate created successfully'
            ]);
        } else {
            throw new Exception('Failed to create candidate');
        }
        
    } elseif ($action === 'update') {
        $candidateId = $_POST['candidate_id'] ?? '';
        $candidateName = $_POST['candidate_name'] ?? '';
        $position = $_POST['position'] ?? '';
        
        if (empty($candidateId) || empty($candidateName) || empty($position)) {
            throw new Exception('Candidate ID, name and position are required');
        }
        
        // Handle photo upload
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../Images/Candidates/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $filename = 'candidate_' . time() . '.' . $ext;
            $destination = $uploadDir . $filename;
            
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $destination)) {
                $photoUrl = '../Images/Candidates/' . $filename;
                $query = "UPDATE voting_candidates SET candidate_name = ?, position = ?, photo_url = ? WHERE id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("sssi", $candidateName, $position, $photoUrl, $candidateId);
            } else {
                throw new Exception('Failed to upload photo');
            }
        } else {
            $query = "UPDATE voting_candidates SET candidate_name = ?, position = ? WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ssi", $candidateName, $position, $candidateId);
        }
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Candidate updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update candidate');
        }
    } else {
        throw new Exception('Invalid action');
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