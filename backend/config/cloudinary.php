<?php

return [
    'cloud_url' => env('CLOUDINARY_URL', 'cloudinary://'.env('CLOUDINARY_KEY').':'.env('CLOUDINARY_SECRET').'@'.env('CLOUDINARY_CLOUD_NAME')),
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
    'upload_route' => env('CLOUDINARY_UPLOAD_ROUTE'),
    'upload_action' => env('CLOUDINARY_UPLOAD_ACTION'),
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),
];