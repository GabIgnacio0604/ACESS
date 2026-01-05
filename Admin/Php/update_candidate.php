<?php
session_start();
if ($_SESSION['role'] != 'admin') {
   header("Location: index.php");
   exit;
}

$conn = new mysqli("localhost", "u465284186_ACESS", "Acess12345", "u465284186_ACESS");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $name = $_POST['name'];
    $position = $_POST['position'];

    $stmt = $conn->prepare("UPDATE voting_candidates SET candidate_name=?, position=? WHERE id=?");
    $stmt->bind_param("ssi", $name, $position, $id);
    $stmt->execute();
    $stmt->close();

    header("Location: edit_candidates.php");
    exit;
}

$id = $_GET['id'];
$result = $conn->query("SELECT * FROM voting_candidates WHERE id=$id");
$candidate = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Update Candidate</title>
</head>
<body>
  <h1>Update Candidate</h1>
  <form method="POST">
    <input type="hidden" name="id" value="<?php echo $candidate['id']; ?>">
    <label>Name:</label>
    <input type="text" name="name" value="<?php echo htmlspecialchars($candidate['candidate_name']); ?>" required><br>
    <label>Position:</label>
    <input type="text" name="position" value="<?php echo htmlspecialchars($candidate['position']); ?>" required><br>
    <button type="submit">Update</button>
  </form>
  <a href="edit_candidates.php">Back</a>
</body>
</html>
