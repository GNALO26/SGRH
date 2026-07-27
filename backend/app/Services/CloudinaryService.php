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
        // Vérifier que la configuration Cloudinary est présente
        $cloudinaryUrl = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
        if (!$cloudinaryUrl) {
            throw new Exception('Cloudinary n\'est pas configuré. Ajoutez CLOUDINARY_URL dans les variables d\'environnement.');
        }

        try {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder' => $folder,
                'secure' => true,
            ]);
        } catch (\Exception $e) {
            throw new Exception('Erreur Cloudinary : ' . $e->getMessage(), 0, $e);
        }

        if (!$result || !method_exists($result, 'getSecurePath')) {
            throw new Exception('Réponse Cloudinary invalide. Vérifiez votre configuration.');
        }

        $url = $result->getSecurePath();
        if (!$url) {
            throw new Exception('Impossible de récupérer l\'URL sécurisée.');
        }

        return $url;
    }
}