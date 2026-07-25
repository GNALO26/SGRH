<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;

class CloudinaryService
{
    public function upload(UploadedFile $file, string $folder = 'sgrh'): string
    {
        $result = Cloudinary::upload($file->getRealPath(), [
            'folder' => $folder,
            'secure' => true,
        ]);

        if (!$result || !method_exists($result, 'getSecurePath')) {
            throw new Exception('Réponse Cloudinary invalide. Vérifiez votre configuration CLOUDINARY_URL.');
        }

        $url = $result->getSecurePath();
        if (!$url) {
            throw new Exception('Impossible d\'obtenir l\'URL sécurisée depuis Cloudinary.');
        }

        return $url;
    }
}