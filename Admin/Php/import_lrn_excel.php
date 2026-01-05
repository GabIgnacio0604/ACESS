<?php
// import_lrn_excel.php
header('Content-Type: application/json');

require_once __DIR__ . '/../../Accounts/db_connection.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

try {
    // Check upload
    if (!isset($_FILES['excelFile']) || $_FILES['excelFile']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error.');
    }

    // File size limit (5MB)
    $maxSize = 5 * 1024 * 1024;
    if ($_FILES['excelFile']['size'] > $maxSize) {
        throw new Exception('File too large. Max 5MB allowed.');
    }

    // File type validation
    $allowedExt = ['xlsx', 'xls', 'csv'];
    $fileName = $_FILES['excelFile']['name'];
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt)) {
        throw new Exception('Invalid file type. Use .xlsx, .xls, or .csv');
    }

    $tmpPath = $_FILES['excelFile']['tmp_name'];

    // Load Excel file
    $spreadsheet = IOFactory::load($tmpPath);
    $worksheet = $spreadsheet->getActiveSheet();

    $lrns = [];

    // Loop through rows (skip header)
    foreach ($worksheet->getRowIterator() as $index => $row) {
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false);

        $values = [];
        foreach ($cellIterator as $cell) {
            $values[] = trim($cell->getFormattedValue());
        }

        $candidate = $values[0] ?? '';
        if ($candidate === '') continue;

        // Skip header
        if (preg_match('/lrn|learner/i', $candidate)) continue;

        // Clean and normalize LRN
        $candidate = preg_replace('/\s+/', '', $candidate);
        $candidate = preg_replace('/[^0-9A-Za-z]/', '', $candidate);

        if ($candidate !== '') {
            $lrns[] = $candidate;
        }
    }

    if (empty($lrns)) {
        throw new Exception('No valid LRN found in the uploaded file.');
    }

    // Start DB transaction
    $conn->begin_transaction();

    // Prepare dynamic placeholders
    $placeholders = implode(',', array_fill(0, count($lrns), '?'));
    $types = str_repeat('s', count($lrns));

    // ✅ FIXED TABLE NAME — was "users", now "accounts"
    // ✅ FIXED STATUS CHANGE — "pending" → "active"
    $sql = "UPDATE accounts SET status = 'active' WHERE lrn IN ($placeholders) AND status = 'pending'";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Dynamic bind
    $params = [$types];
    foreach ($lrns as $val) {
        $params[] = $val;
    }

    // Reference array for bind_param
    $tmp = [];
    foreach ($params as $key => $value) {
        $tmp[$key] = &$params[$key];
    }

    call_user_func_array([$stmt, 'bind_param'], $tmp);

    $stmt->execute();
    $affected = $stmt->affected_rows;

    $stmt->close();
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => "✅ Imported " . count($lrns) . " LRN(s). Activated {$affected} account(s).",
        'imported_count' => count($lrns),
        'activated' => $affected
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn->connect_errno === 0) {
        @$conn->rollback();
    }
    echo json_encode([
        'success' => false,
        'message' => '❌ Error: ' . $e->getMessage()
    ]);
}
