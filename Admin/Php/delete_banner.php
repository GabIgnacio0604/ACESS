<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Directory where banners are stored
$bannerDir = __DIR__ . '/../../Images/Banners/';

// Read JSON input (sent from JS)
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['file'])) {
    echo json_encode(['success' => false, 'error' => 'No file specified']);
    exit;
}

// Extract the filename from the full image URL
$filename = basename(parse_url($data['file'], PHP_URL_PATH));
$target = $bannerDir . $filename;

// Check if the file exists, then delete it
if (file_exists($target)) {
    if (unlink($target)) {
        echo json_encode(['success' => true, 'deleted' => $filename]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Unable to delete file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'File not found']);
}
?>
