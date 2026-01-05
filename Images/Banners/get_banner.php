<?php
header('Content-Type: application/json');

$uploadDir = __DIR__; // current folder (Banners)

$files = glob($uploadDir . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
$banners = [];

foreach ($files as $file) {
    // create relative path
    $banners[] = '../Images/Banners/' . basename($file);
}

if (count($banners) > 0) {
    echo json_encode(['success' => true, 'banners' => $banners]);
} else {
    echo json_encode([
        'success' => true,
        'banners' => ['../Images/Banners/default_banner.png']
    ]);
}
