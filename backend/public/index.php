<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// ========== GESTION CORS (ajoutée avant toute chose) ==========
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origin = getenv('CORS_ALLOWED_ORIGINS') ?: 'https://sgrhromas.netlify.app';
    header("Access-Control-Allow-Origin: $allowed_origin");
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// Intercepter les requêtes OPTIONS (pré‑vol CORS) et répondre 200 immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ==============================================================

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());