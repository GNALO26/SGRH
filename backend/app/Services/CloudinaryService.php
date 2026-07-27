<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;

class CloudinaryService
{
    public function upload(UploadedFile $file, string $folder = 'sirh'): string
    {
        if (!config('cloudinary.cloud_url') && !env('CLOUDINARY_URL')) {
            throw new Exception('Cloudinary n\'est pas configuré. Ajoutez CLOUDINARY_URL dans les variables d\'environnement.');
        }

        try {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder' => $folder,
                'secure'  => true,
            ]);
        } catch (\Exception $e) {
            throw new Exception('Erreur Cloudinary : ' . $e->getMessage(), 0, $e);
        }

        if (!$result || !method_exists($result, 'getSecurePath')) {
            throw new Exception('Réponse Cloudinary invalide.');
        }

        return $result->getSecurePath();
    }
}