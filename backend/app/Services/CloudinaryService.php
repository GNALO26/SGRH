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
        Log::info('Cloudinary upload start', [
            'file' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'cloudinary_url_exists' => !empty(env('CLOUDINARY_URL')),
        ]);

        try {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder' => $folder,
                'secure'  => true,
            ]);
            Log::info('Cloudinary upload success');
        } catch (\Exception $e) {
            Log::error('Cloudinary upload error', ['message' => $e->getMessage()]);
            throw new Exception('Erreur Cloudinary : ' . $e->getMessage(), 0, $e);
        }

        return $result->getSecurePath();
    }
}