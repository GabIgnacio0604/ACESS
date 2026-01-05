<?php
header('Content-Type: application/json');

// Database connection
require_once __DIR__ . '/db_connection.php';

// Get JSON POST body
$input = json_decode(file_get_contents("php://input"), true);
$email = $conn->real_escape_string(trim($input['email'] ?? ''));

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

// Check if email exists in database
$sql = "SELECT id, fullname FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found in our system."]);
    exit;
}

$user = $result->fetch_assoc();

// Generate random reset token (max 255 characters)
$resetToken = bin2hex(random_bytes(64)); // 128 characters

// Update user's reset_password field
$updateSql = "UPDATE users SET reset_password = ? WHERE email = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("ss", $resetToken, $email);

if (!$updateStmt->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to generate reset token."]);
    exit;
}

// Prepare reset link
$resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/reset-password.html?token=" . $resetToken;

// Email configuration
$to = $email;
$subject = 'Password Reset Request - ACESS Student Portal';
$message = '
<!DOCTYPE html>
<html>
<head>
    <style>
       body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #000;
      background-color: #f9e58c; /* gold background */
      background-image: url("https://yourdomain.com/Images/School_Logo.jpg"); /* replace with your actual logo path */
      background-repeat: no-repeat;
      background-position: right center;
      background-size: 150px auto;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background-color: #fffdf3;
      border: 2px solid #800000; /* maroon border */
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .header {
      background-color: #800000; /* maroon header */
      color: #f5d76e; /* gold text */
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }

    .header img {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      margin-bottom: 10px;
      border: 2px solid #f5d76e;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
    }

    .content {
      background-color: #fffaf0;
      padding: 30px;
      border: 1px solid #d4af37;
      border-radius: 0 0 8px 8px;
    }

    .content p {
      margin-bottom: 16px;
    }

    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #800000;
      color: #f5d76e;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #a00000;
    }

    .link-box {
      word-break: break-all;
      background-color: #fff5cc;
      padding: 10px;
      border: 1px solid #d4af37;
      border-radius: 5px;
    }

    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #000;
      border-top: 1px solid #d4af37;
      background-color: #f9e58c;
      margin-top: 20px;
    }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello ' . htmlspecialchars($user['fullname']) . ',</p>
            <p>We received a request to reset your password for your ACESS Student Portal account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
                <a href="' . $resetLink . '" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
                ' . $resetLink . '
            </p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            <p>&copy; ' . date('Y') . ' STA. CRUZ HIGHSCHOOL - ACESS Student Portal</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
';

// Headers for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: ACESS Admin <admin@acess.space>" . "\r\n";
$headers .= "Reply-To: admin@acess.space" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to, $subject, $message, $headers)) {
    echo json_encode([
        "success" => true, 
        "message" => "Password reset link has been sent to your email. Please check your inbox."
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Failed to send reset email. Please try again later."
    ]);
}

$conn->close();
?>
