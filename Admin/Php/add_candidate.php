<?php
session_start();
if ($_SESSION['role'] != 'admin') {
   header("Location: index.php");
   exit;
}

$conn = new mysqli("localhost", "root", "", "db_connection.php");

function getVotingSettings($conn) {
    $query = "SELECT * FROM voting_settings WHERE id = 1 LIMIT 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $data = $result->fetch_assoc();

        return [
            'id' => $data['id'],
            'voting_active' => (bool)$data['voting_active'],
            'last_updated' => $data['last_updated'],
            'voting_year' => $data['voting_year']
        ];
    } else {
        throw new Exception('No voting settings found');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $position = $_POST['position'];
    $settings = getVotingSettings($conn);
    $year = $settings['voting_year'];
    $stmt = $conn->prepare("INSERT INTO voting_candidates (candidate_name, position) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $name, $position, $year);
    $stmt->execute();
    $stmt->close();

    header("Location: edit_candidates.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Add Candidate</title>
</head>
<body>
  <h1>Add New Candidate</h1>
  <form method="POST">
    <label>Name:</label>
    <input type="text" name="name" required><br>
    <label>Position:</label>
    <input type="text" name="position" required><br>
    <button type="submit">Add Candidate</button>
  </form>
  <a href="edit_candidates.php">Back</a>
</body>
</html>
