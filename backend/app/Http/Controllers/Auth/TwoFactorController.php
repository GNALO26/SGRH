<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TwoFactorController extends Controller
{
    /**
     * Vérifie le code soumis et renvoie le token Sanctum.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user ||
            !$user->two_factor_code ||
            $user->two_factor_code !== $request->code ||
            now()->greaterThan($user->two_factor_expires_at)
        ) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        // Code correct : effacer les données 2FA et générer le token
        $user->update([
            'two_factor_code'       => null,
            'two_factor_expires_at' => null,
        ]);

        $token = $user->createToken('auth_token', ['*'], now()->addDay())->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * Renvoie un nouveau code par email.
     */
    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'two_factor_code'       => $code,
            'two_factor_expires_at' => now()->addMinutes(2),
        ]);

        Mail::to($user->email)->send(new TwoFactorCodeMail($code));

        return response()->json(['message' => 'Code renvoyé.']);
    }
}