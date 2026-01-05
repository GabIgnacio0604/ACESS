<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../../Accounts/db_connection.php';

// Get club ID from request
$club_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$club_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Club ID is required'
    ]);
    exit;
}

try {
    // Get club details
    $club_query = "SELECT * FROM clubs WHERE id = ?";
    $stmt = $conn->prepare($club_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $club_result = $stmt->get_result();
    $club_details = $club_result->fetch_assoc();
    $stmt->close();

    if (!$club_details) {
        echo json_encode([
            'success' => false,
            'message' => 'Club not found'
        ]);
        exit;
    }

    // Get club members with roles
    $members_query = "
        SELECT 
            u.id,
            u.fullname,
            u.email,
            u.role AS system_role,
            cm.role AS club_role,
            cm.joined_at,
            cm.approved_at,
            CASE
                WHEN cm.role = 'president' THEN 'President'
                WHEN cm.role = 'vice_president' THEN 'Vice President'
                WHEN cm.role = 'advisor' THEN 'Advisor'
                ELSE 'Member'
            END AS display_role
        FROM club_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.club_id = ?
        ORDER BY 
            CASE cm.role
                WHEN 'president' THEN 1
                WHEN 'vice_president' THEN 2
                WHEN 'advisor' THEN 3
                ELSE 4
            END,
            u.fullname
    ";

    $stmt = $conn->prepare($members_query);
    $stmt->bind_param("i", $club_id);
    $stmt->execute();
    $members_result = $stmt->get_result();

    $members = [];
    $president = null;
    $vp = null;
    $advisors = [];

    while ($member = $members_result->fetch_assoc()) {
        $members[] = $member;

        // Separate president, VP, and advisors for easy access
        if ($member['club_role'] === 'president') $president = $member['fullname'];
        if ($member['club_role'] === 'vice_president') $vp = $member['fullname'];
        if ($member['club_role'] === 'advisor') $advisors[] = $member['fullname'];
    }
    $stmt->close();

    // Prepare response
    $response = [
        'success' => true,
        'club' => [
            'id' => $club_details['id'],
            'name' => $club_details['club_name'],
            'adviser' => $club_details['adviser'] ?? null,
            'description' => $club_details['description'] ?? null
        ],
        'president' => $president ?? 'Not assigned',
        'vice_president' => $vp ?? 'Not assigned',
        'president_id' => $club_details['president_id'] ?? null,
        'vice_president_id' => $club_details['vice_president_id'] ?? null,
        'advisors' => $advisors,
        'members' => $members
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
