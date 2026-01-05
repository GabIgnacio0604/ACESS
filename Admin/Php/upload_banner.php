<?php
header('Content-Type: application/json');

// Ensure file was uploaded
if (!isset($_FILES['banner']) || $_FILES['banner']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error occurred.']);
    exit;
}

$file = $_FILES['banner'];

// ✅ File size check (max 2MB)
$maxSize = 2 * 1024 * 1024; // 2 MB in bytes
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'File size exceeds 2   MB limit.']);
    exit;
}

// ✅ File type check (only JPG/PNG)
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Only JPG and PNG images are allowed.']);
    exit;
}

// ✅ Save file
$uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Images/Banners/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique file name
$fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'banner_' . time() . '.' . $fileExt;
$uploadPath = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    // Return file path relative to web root
    $fileUrl = '/Images/Banners/' . $fileName;
    echo json_encode(['success' => true, 'file' => $fileUrl]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to save file.']);
}
?>
