<?php

$VERBOSE = false;

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');

try {
    // Log incoming request
    $raw_input = file_get_contents('php://input');

    if ($VERBOSE) {
        error_log("Received data length: " . strlen($raw_input));
    }
    
    // Validate input
    if (empty($raw_input)) {
        throw new Exception('No data received');
    }

    // Try to decode JSON
    $matches = json_decode($raw_input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }

    // Basic validation
    if (!is_array($matches)) {
        throw new Exception('Invalid data format: expected array');
    }

    if ($VERBOSE) {
        // Add debug logging
        error_log("Matches count: " . count($matches));
        error_log("Matches structure: " . print_r($matches[0], true));
    }
    
    // Validate each match
    foreach ($matches as $index => $match) {
        if (!validateMatch($match)) {
            throw new Exception("Invalid match data structure at index $index");
        }
    }

    // Create data directory if needed
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        if (!mkdir($dataDir, 0755, true)) {
            throw new Exception('Failed to create data directory');
        }
    }

    // Save file with debug info
    $debug = [
        'timestamp' => date('Y-m-d H:i:s'),
        'matches_count' => count($matches),
        'data' => $matches
    ];

    $filePath = $dataDir . '/matches.json';
    if (file_put_contents($filePath, json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) {
        throw new Exception('Failed to write file');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Saved ' . count($matches) . ' matches'
    ]);

} catch (Exception $e) {
    error_log("Error saving matches: " . $e->getMessage());
    error_log("Raw input: " . substr($raw_input, 0, 1000)); // Log first 1000 chars
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => json_last_error_msg()
    ]);
}

function validateMatch($match) {
    $requiredFields = ['league', 'league_match_id', 'date_obj', 'date', 'formatted_date', 'team1', 'team2'];

    foreach ($requiredFields as $field) {
        if (!isset($match[$field])) {
            return false;
        }
    }

    // Validate date format (dd/mm/yyyy)
    if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $match['date'])) {
        return false;
    }

    // Allow empty strings for 'time', 'score', and 'location'
    $optionalFields = ['time', 'score', 'location'];
    foreach ($optionalFields as $field) {
        if (!isset($match[$field])) {
            $match[$field] = '';
        }
    }

    return true;
}