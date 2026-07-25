<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// ========== GESTION CORS SIMPLIFIÉE ==========
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
header('Access-Control-Max-Age: 86400');

if (isset(\['REQUEST_METHOD']) && \['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ==============================================

if (file_exists(\ = __DIR__.'/../storage/framework/maintenance.php')) {
    require \;
}

require __DIR__.'/../vendor/autoload.php';

/** @var \Illuminate\Foundation\Application \ */
\ = require_once __DIR__.'/../bootstrap/app.php';

\->handleRequest(Request::capture());
