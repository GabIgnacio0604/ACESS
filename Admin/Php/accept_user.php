<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
$role  = isset($data['role']) && !empty($data['role']) ? $conn->real_escape_string($data['role']) : 'user';

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Missing email"]);
    exit;
}

$query = "UPDATE users SET status='active', role='$role' WHERE email='$email'";

if ($conn->query($query)) {
    echo json_encode(["success" => true, "message" => "User approved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to approve user: " . $conn->error]);
}

$conn->close();

if (!function_exists('autoApproveByLRN')) {
    function autoApproveByLRN($email, $conn) {
        // Check if applicant has an LRN
        $checkApplicant = $conn->prepare("SELECT lrn FROM applications WHERE email = ?");
        $checkApplicant->bind_param("s", $email);
        $checkApplicant->execute();
        $result = $checkApplicant->get_result();
        if ($result->num_rows === 0) return false;

        $applicant = $result->fetch_assoc();
        $lrn = $applicant['lrn'];

        // Check if LRN exists in valid_lrns table
        $checkLRN = $conn->prepare("SELECT * FROM valid_lrns WHERE lrn = ?");
        $checkLRN->bind_param("s", $lrn);
        $checkLRN->execute();
        $found = $checkLRN->get_result()->num_rows > 0;

        if ($found) {
            // Auto-approve
            $approve = $conn->prepare("UPDATE users SET status='active', role='user' WHERE email=?");
            $approve->bind_param("s", $email);
            $approve->execute();
            return true;
        }
        return false;
    }
}

if (!empty($email)) {
    autoApproveByLRN($email, $conn);
}
?>