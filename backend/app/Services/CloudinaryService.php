<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;

class CloudinaryService
{
    public function upload(UploadedFile $file, string $folder = 'sirh'): string
    {
        $result = Cloudinary::upload($file->getRealPath(), [
            'folder' => $folder,
            'secure' => true,
        ]);

        if (!$result || !method_exists($result, 'getSecurePath')) {
            throw new Exception('Réponse Cloudinary invalide.');
        }

        return $result->getSecurePath();
    }
}