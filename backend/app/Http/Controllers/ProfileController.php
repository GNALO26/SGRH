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

        try {
            $url = app(CloudinaryService::class)->upload($request->file('avatar'), 'avatars');
        } catch (\Exception $e) {
            Log::error('Erreur upload avatar', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de l\'upload. Vérifiez la configuration Cloudinary. Détail : ' . $e->getMessage()
            ], 500);
        }

        $request->user()->update(['avatar_url' => $url]);

        return response()->json(['avatar_url' => $url]);
    }
}