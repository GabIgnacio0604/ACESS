<?php
header('Content-Type: application/json');
session_start();

// Database connection
require_once __DIR__ . '/db_connection.php';

// Get JSON POST body
$input = json_decode(file_get_contents("php://input"), true);
$email = $conn->real_escape_string(trim($input['email'] ?? ''));
$password = trim($input['password'] ?? '');
$recaptchaResponse = $input['recaptcha_token'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit;
}

// Verify Google reCAPTCHA v2
if (empty($recaptchaResponse)) {
    echo json_encode(["success" => false, "message" => "CAPTCHA response missing."]);
    exit;
}

$recaptchaSecret = "6Lf9XbsrAAAAABkbRL1nP7k3bhPJKSMMDtkZuIkt";
$verify = file_get_contents(
    "https://www.google.com/recaptcha/api/siteverify?secret=" .
    urlencode($recaptchaSecret) .
    "&response=" .
    urlencode($recaptchaResponse)
);

$captchaSuccess = json_decode($verify, true);
if (!$captchaSuccess || empty($captchaSuccess['success']) || $captchaSuccess['success'] !== true) {
    echo json_encode(["success" => false, "message" => "CAPTCHA verification failed."]);
    exit;
}

// LOGIN ATTEMPT LIMITS
$ip = $_SERVER['REMOTE_ADDR'];
$maxAttempts = 5;
$lockoutTime = 5 * 60;

$conn->query("
    CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        ip VARCHAR(45),
        attempts INT DEFAULT 0,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        locked_until TIMESTAMP NULL
    )
");

// Check if user/IP has exceeded attempts
$stmt = $conn->prepare("SELECT attempts, locked_until FROM login_attempts WHERE email=? OR ip=? LIMIT 1");
$stmt->bind_param("ss", $email, $ip);
$stmt->execute();
$result = $stmt->get_result();
$attemptData = $result->fetch_assoc();

if ($attemptData && $attemptData['locked_until'] && strtotime($attemptData['locked_until']) > time()) {
    $remaining = ceil((strtotime($attemptData['locked_until']) - time()) / 60);
    echo json_encode(["success" => false, "message" => "Too many failed attempts. Try again in $remaining minute(s)."]);
    exit;
}

// Fetch user
$sql = "SELECT id, fullname, password AS hash, role, status FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    record_failed_attempt($conn, $email, $ip, $maxAttempts, $lockoutTime);
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit;
}

$row = $result->fetch_assoc();

// Check password
if (!password_verify($password, $row['hash'])) {
    record_failed_attempt($conn, $email, $ip, $maxAttempts, $lockoutTime);
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit;
}

// Check status
if ($row['status'] !== 'active') {
    echo json_encode(["success" => false, "message" => "Your account is not active. Status: " . $row['status']]);
    exit;
}

// SUCCESSFUL LOGIN — reset attempt count
$stmt = $conn->prepare("DELETE FROM login_attempts WHERE email=? OR ip=?");
$stmt->bind_param("ss", $email, $ip);
$stmt->execute();

// Role-based redirect
switch (strtolower($row['role'])) {
    case 'admin':
        $redirect = "./Admin/ACESS_Admin_Dashboard.html";
        break;
    case 'teacher':
        $redirect = "./Teacher/ACESS_Dashboard.html";
        break;
    case 'studentcouncil':
        $redirect = "./StudentCouncil/ACESS_Dashboard.html";
        break;
    case 'superadmin':
        $redirect = "./SuperAdmin/ACESS_Dashboard.html";
        break;
    default:
        $redirect = "./User/ACESS_Dashboard.html";
        break;
}

// Set session
$_SESSION['user_id'] = $row['id'];
$_SESSION['fullname'] = $row['fullname'];
$_SESSION['role'] = $row['role'];
$_SESSION['last_activity'] = time();
$_SESSION['created'] = time();

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "fullname" => $row['fullname'],
    "role" => $row['role'],
    "redirect" => $redirect
]);

// Helper function to record failed attempts
function record_failed_attempt($conn, $email, $ip, $maxAttempts, $lockoutTime) {
    $stmt = $conn->prepare("SELECT * FROM login_attempts WHERE email=? OR ip=? LIMIT 1");
    $stmt->bind_param("ss", $email, $ip);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    if ($row) {
        $attempts = $row['attempts'] + 1;
        if ($attempts >= $maxAttempts) {
            $lockedUntil = date('Y-m-d H:i:s', time() + $lockoutTime);
            $update = $conn->prepare("UPDATE login_attempts SET attempts=?, locked_until=?, last_attempt=NOW() WHERE id=?");
            $update->bind_param("isi", $attempts, $lockedUntil, $row['id']);
            $update->execute();
        } else {
            $update = $conn->prepare("UPDATE login_attempts SET attempts=?, last_attempt=NOW() WHERE id=?");
            $update->bind_param("ii", $attempts, $row['id']);
            $update->execute();
        }
    } else {
        $insert = $conn->prepare("INSERT INTO login_attempts (email, ip, attempts, last_attempt) VALUES (?, ?, 1, NOW())");
        $insert->bind_param("ss", $email, $ip);
        $insert->execute();
    }
}
?>