<?php
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

include 'db_connection.php';

if (isset($_POST['import'])) {
    $fileName = $_FILES['file']['tmp_name'];

    if ($_FILES['file']['size'] > 0) {
        $spreadsheet = IOFactory::load($fileName);
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        // Skip header row
        for ($i = 1; $i < count($rows); $i++) {
            $email = mysqli_real_escape_string($conn, $rows[$i][0]);
            $fullname = mysqli_real_escape_string($conn, $rows[$i][1]);
            $password_plain = $rows[$i][2];
            $lrn = mysqli_real_escape_string($conn, $rows[$i][3]);
            $role = mysqli_real_escape_string($conn, $rows[$i][4]);
            $status = "active";

            // Hash the password
            $password = password_hash($password_plain, PASSWORD_DEFAULT);

            $query = "INSERT INTO accounts (email, fullname, password, lrn, role, status, created_at) 
                      VALUES ('$email', '$fullname', '$password', '$lrn', '$role', '$status', NOW())";
            mysqli_query($conn, $query);
        }

        echo "<script>alert('Data imported successfully!');</script>";
    }
}
?>

<form method="POST" enctype="multipart/form-data">
  <input type="file" name="file" accept=".xlsx,.xls" required>
  <button type="submit" name="import">Import</button>
</form>
