<?php
session_start();
require_once __DIR__ . '/../../Accounts/db_connection.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
  die("Error: You must be logged in to vote.");
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];
$president = $_POST['president'] ?? '';
$vice_president = $_POST['vice_president'] ?? '';
$secretary = $_POST['secretary'] ?? '';
$list_members = $_POST['list_members'] ?? '';

if (!$president || !$vice_president || !$secretary || !$list_members) {
  die("Error: Please fill out all vote selections.");
}

$conn = new mysqli('localhost', 'root', '', 'acess');
if ($conn->connect_error) {
  die("Database connection failed: " . $conn->connect_error);
}

// Check if user already voted
$check = $conn->prepare("SELECT id FROM votes WHERE user_id = ?");
$check->bind_param("i", $user_id);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
  echo "<script>alert('You have already voted!'); window.location.href='Voting.html';</script>";
  exit();
}

// Insert vote
$stmt = $conn->prepare("INSERT INTO votes (user_id, president, vice_president, secretary, list_members) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $user_id, $president, $vice_president, $secretary, $list_members);

if ($stmt->execute()) {
  $dashboardPath = '';
  // Maintain original role and redirect to appropriate dashboard
  switch ($role) {
    case 'admin':
      $dashboardPath = '../Admin/ACESS_Admin_Dashboard.html';
      break;
    case 'teacher':
      $dashboardPath = '../Teacher/ACESS_Dashboard.html';
      break;
    case 'studentcouncil':
      $dashboardPath = '../StudentCouncil/ACESS_Dashboard.html';
      break;
    case 'superadmin':
      $dashboardPath = '../SuperAdmin/ACESS_Dashboard.html';
      break;
    case 'user':
    default:
      $dashboardPath = '../User/ACESS_Dashboard.html';
      break;
  }
  echo "<script>alert('Vote submitted successfully!'); window.location.href='" . $dashboardPath . "';</script>";
} else {
  echo "<script>alert('Error submitting vote.'); window.location.href='Voting.html';</script>";
}

$stmt->close();
$conn->close();
?>
