<?php

namespace App\Http\Controllers;

use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png',
        ]);

        $file = $request->file('avatar');
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'Fichier invalide ou absent.'], 422);
        }

        try {
            $url = app(CloudinaryService::class)->upload($file, 'avatars');
        } catch (\Exception $e) {
            Log::error('Upload avatar', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }

        $request->user()->update(['avatar_url' => $url]);
        return response()->json(['avatar_url' => $url]);
    }
}