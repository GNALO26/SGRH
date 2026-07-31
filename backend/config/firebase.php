<?php

return [
    'credentials' => [
        'file' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase-credentials.json')),
    ],
    'project_id' => env('FIREBASE_PROJECT_ID', 'sgrh-958de'), // ← votre ID de projet
];