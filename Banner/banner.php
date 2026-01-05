<?php
header('Content-Type: application/json');

$latestFile = __DIR__ . '/latest.txt';

if (file_exists($latestFile)) {
    $path = trim(file_get_contents($latestFile));
    echo json_encode(['file' => $path]);
} else {
    echo json_encode(['file' => '../Images/Banners/default_banner.jpg']);
}