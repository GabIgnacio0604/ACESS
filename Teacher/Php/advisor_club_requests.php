<?php
include 'db_connect.php';
session_start();
$advisor_id = $_SESSION['user_id'];

// Get clubs where the logged-in user is advisor
$sql = "
  SELECT cm.id AS member_id, u.full_name, u.email, c.club_name
  FROM club_members cm
  JOIN clubs c ON cm.club_id = c.id
  JOIN users u ON cm.user_id = u.id
  WHERE c.advisor_id = ? AND cm.approved_at IS NULL
";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $advisor_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<h3>Pending Join Requests</h3>
<?php while ($row = $result->fetch_assoc()): ?>
  <div class="pending">
    <p><b><?= htmlspecialchars($row['full_name']) ?></b> wants to join <b><?= htmlspecialchars($row['club_name']) ?></b></p>
    <button onclick="approveMember(<?= $row['member_id'] ?>)">Accept</button>
    <button onclick="rejectMember(<?= $row['member_id'] ?>)">Reject</button>
  </div>
<?php endwhile; ?>
