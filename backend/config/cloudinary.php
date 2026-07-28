<?php

return [
    'cloudinary_url' => env('CLOUDINARY_URL', 'cloudinary://' . env('CLOUDINARY_KEY') . ':' . env('CLOUDINARY_SECRET') . '@' . env('CLOUDINARY_CLOUD_NAME')),

    /*
    |--------------------------------------------------------------------------
    | Fallback explicite : utilisez les clés individuelles si CLOUDINARY_URL est vide.
    |--------------------------------------------------------------------------
    */
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key'    => env('CLOUDINARY_KEY'),
    'api_secret' => env('CLOUDINARY_SECRET'),
    'secure'     => true,

    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
    'upload_route'  => env('CLOUDINARY_UPLOAD_ROUTE'),
    'upload_action' => env('CLOUDINARY_UPLOAD_ACTION'),
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),
];