<?php

// Email configuration
$to = 'gabignacio0123@gmail.com';
$subject = 'Test Subject';
$message = 'This is a test email body';

// Headers for HTML email and from address
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Admin <admin@acess.space>" . "\r\n";
$headers .= "Reply-To: admin@acess.space" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to, $subject, $message, $headers)) {
    echo 'Message has been sent';
} else {
    echo 'Message could not be sent';
}