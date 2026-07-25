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
        $url = env('CLOUDINARY_URL');
        if (!$url) {
            throw new Exception('CLOUDINARY_URL is not set.');
        }
        $this->cloudinary = new Cloudinary($url);
    }

    /**
     * @throws Exception
     */
    public function upload(UploadedFile $file, string $folder = 'sgrh'): string
    {
        $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'secure' => true,
        ]);

        $url = $result['secure_url'] ?? null;
        if (!$url) {
            throw new Exception('Impossible de récupérer l\'URL sécurisée.');
        }

        return $url;
    }
}