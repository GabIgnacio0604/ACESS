<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

// Check connection
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

function loadMembers($conn, $club_id) {
    $stmt = $conn->prepare("SELECT users.id, users.fullname, users.email, club_members.approved_at FROM club_members 
                            JOIN users ON club_members.user_id = users.id 
                            WHERE club_members.club_id = ?");
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $members = [];
    while ($row = $result->fetch_assoc()) {
        $members[] = $row;
    }
    $stmt->close();
    return $members;
}

function getUserById($conn, $user_id) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $adviser = $result->fetch_assoc();
    $stmt->close();
    return $adviser;
}

// Fetch all clubs from the database
$query = "SELECT * FROM clubs ORDER BY club_name ASC";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $clubs = [];
    while ($row = $result->fetch_assoc()) {
        $adviser = !empty($row['adviser']) ? getUserById($conn, $row['adviser']) : null;
        $president = !empty($row['president_id']) ? getUserById($conn, $row['president_id']) : null;
        $vp = !empty($row['vice_president_id']) ? getUserById($conn, $row['vice_president_id']) : null;
        
        $clubs[] = array_merge($row, [
            'members' => loadMembers($conn, $row['id']),
            'adviser' => $adviser,
            'president' => $president,
            'vice_president' => $vp
        ]);
    }
    echo json_encode([
        'success' => true,
        'clubs' => $clubs
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No clubs found.'
    ]);
}

$conn->close();
?>