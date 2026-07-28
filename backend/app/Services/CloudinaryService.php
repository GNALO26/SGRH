<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_KEY');
        $apiSecret = env('CLOUDINARY_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new Exception('Configuration Cloudinary incomplète. Vérifiez CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY et CLOUDINARY_SECRET.');
        }

        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key'    => $apiKey,
                'api_secret' => $apiSecret,
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    /**
     * Téléverse un fichier sur Cloudinary et retourne l'URL sécurisée.
     *
     * @throws Exception
     */
    public function upload(UploadedFile $file, string $folder = 'sirh'): string
    {
        try {
            $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
            ]);
        } catch (\Exception $e) {
            throw new Exception('Erreur Cloudinary : ' . $e->getMessage(), 0, $e);
        }

        if (!isset($result['secure_url'])) {
            throw new Exception('Réponse Cloudinary invalide : URL sécurisée manquante.');
        }

        return $result['secure_url'];
    }
}