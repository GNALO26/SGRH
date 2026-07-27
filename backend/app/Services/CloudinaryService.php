<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;

class CloudinaryService
{
    /**
     * Téléverse un fichier sur Cloudinary et retourne l'URL sécurisée.
     *
     * @throws Exception
     */
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