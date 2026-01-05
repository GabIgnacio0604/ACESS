<?php
header('Content-Type: application/json');
session_start();

include_once __DIR__ . '/../../Accounts/db_connection.php';

// Get data from either JSON body or POST
$input = json_decode(file_get_contents('php://input'), true);
$club_id = $input['club_id'] ?? $_POST['club_id'] ?? null;
$description = $input['description'] ?? $_POST['description'] ?? '';
$adviser = $input['adviser'] ?? $_POST['adviser'] ?? null;
$president = $input['president_id'] ?? $_POST['president_id'] ?? null;
$vp = $input['vice_president_id'] ?? $_POST['vice_president_id'] ?? null;

if (empty($club_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing club ID']);
    exit;
}

try {
    // Build dynamic UPDATE query based on non-null fields
    $fields = ["description = ?"];
    $params = [$description];
    $types = "s";
    
    if (!empty($adviser)) {
        $fields[] = "adviser = ?";
        $params[] = $adviser;
        $types .= "i";
    }
    
    if (!empty($president)) {
        $fields[] = "president_id = ?";
        $params[] = $president;
        $types .= "i";
    }
    
    if (!empty($vp)) {
        $fields[] = "vice_president_id = ?";
        $params[] = $vp;
        $types .= "i";
    }
    
    $params[] = $club_id;
    $types .= "i";
    
    $sql = "UPDATE clubs SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Club details updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update club details']);
    }

    $stmt->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
