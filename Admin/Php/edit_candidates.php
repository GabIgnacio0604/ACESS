<?php
session_start();
if ($_SESSION['role'] != 'admin') {
   header("Location: index.php");
   exit;
}

// Database connection
$conn = new mysqli("localhost", "root", "", "db_connection.php");
$result = $conn->query("SELECT * FROM voting_candidates ORDER BY id ASC");
$candidates = $result->fetch_all(MYSQLI_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit Candidates</title>
</head>
<body>
  <h1>Edit Candidates</h1>
  <a href="add_candidate.php">+ Add New Candidate</a>
  <table border="1" cellpadding="10">
    <thead>
      <tr>
        <th>Name</th>
        <th>Position</th>
        <th>Votes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($candidates as $candidate): ?>
        <tr>
          <td><?php echo htmlspecialchars($candidate['candidate_name']); ?></td>
          <td><?php echo htmlspecialchars($candidate['position']); ?></td>
          <td><?php echo $candidate['votes']; ?></td>
          <td>
            <a href="update_candidate.php?id=<?php echo $candidate['id']; ?>">Edit</a> |
            <a href="delete_candidate.php?id=<?php echo $candidate['id']; ?>" onclick="return confirm('Delete this candidate?')">Delete</a>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</body>
</html>
