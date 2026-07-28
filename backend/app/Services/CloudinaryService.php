<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    public function upload(UploadedFile $file, string $folder = 'sirh'): string
    {
        $url = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
        if (!$url) {
            throw new Exception('Cloudinary n\'est pas configuré. Ajoutez CLOUDINARY_URL dans les variables d\'environnement.');
        }

        try {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder' => $folder,
                'secure'  => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Cloudinary upload error', ['message' => $e->getMessage()]);
            throw new Exception('Erreur Cloudinary : ' . $e->getMessage(), 0, $e);
        }

        if (!$result || !method_exists($result, 'getSecurePath')) {
            throw new Exception('Réponse Cloudinary invalide.');
        }

        return $result->getSecurePath();
    }
}