<?php
require_once __DIR__ . '/../Accounts/db_connection.php';
if ($conn) {
  echo "Connected successfully!";
} else {
  echo "Connection failed!";
}
?>