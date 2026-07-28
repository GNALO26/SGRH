<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Exception;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Upload un fichier vers Cloudinary et retourne son URL sécurisée (HTTPS).
     *
     * @param UploadedFile $file Le fichier téléversé
     * @param string $folder Le dossier de destination sur Cloudinary
     * @return string L'URL sécurisée du fichier
     * @throws Exception
     */
    public function upload(UploadedFile $file, string $folder = 'sirh'): string
    {
        $cloudUrl = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
        
        if (empty($cloudUrl)) {
            throw new Exception('Cloudinary n\'est pas configuré. Veuillez définir CLOUDINARY_URL dans le fichier .env.');
        }

        try {
            // Upload via la facade Cloudinary-Laravel
            $uploadedFile = Cloudinary::upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'auto', // Détecte automatiquement (image, pdf, document, etc.)
            ]);

            $securePath = $uploadedFile->getSecurePath();

            if (empty($securePath)) {
                throw new Exception('Impossible d\'obtenir l\'URL sécurisée du fichier envoyé.');
            }

            return $securePath;

        } catch (Exception $e) {
            Log::error('Cloudinary upload error', [
                'message' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
            ]);

            throw new Exception('Erreur lors de l\'envoi vers Cloudinary : ' . $e->getMessage(), $e->getCode(), $e);
        }
    }

    /**
     * Supprime un fichier sur Cloudinary à partir de son Public ID ou de son URL.
     *
     * @param string $publicIdOrUrl
     * @return bool
     */
    public function delete(string $publicIdOrUrl): bool
    {
        try {
            // Extraction du public_id si une URL complète est fournie
            $publicId = $this->extractPublicId($publicIdOrUrl);
            
            if (!$publicId) {
                return false;
            }

            Cloudinary::destroy($publicId);
            return true;

        } catch (Exception $e) {
            Log::error('Cloudinary delete error', [
                'message' => $e->getMessage(),
                'target' => $publicIdOrUrl,
            ]);
            return false;
        }
    }

    /**
     * Extrait le public_id Cloudinary d'une URL
     */
    private function extractPublicId(string $url): ?string
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $url; // On suppose qu'il s'agit déjà d'un public_id
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) return null;

        // Exemple d'extraction depuis /upload/v12345678/folder/filename.jpg
        $parts = explode('/', $path);
        $uploadIndex = array_search('upload', $parts);

        if ($uploadIndex === false) return null;

        // Récupère tout ce qui se trouve après la version (v12345...)
        $relevantParts = array_slice($parts, $uploadIndex + 1);
        
        if (isset($relevantParts[0]) && preg_match('/^v\d+$/', $relevantParts[0])) {
            array_shift($relevantParts);
        }

        $publicIdWithExtension = implode('/', $relevantParts);
        
        // Supprime l'extension du fichier
        return preg_replace('/\.[^.]+$/', '', $publicIdWithExtension);
    }
}