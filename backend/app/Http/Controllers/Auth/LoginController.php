<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Générer le code 2FA
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'two_factor_code'       => $code,
            'two_factor_expires_at' => now()->addMinutes(2),
        ]);

        // Envoyer le code par email
        try {
            Mail::to($user->email)->send(new TwoFactorCodeMail($code));
            Log::info('2FA code sent to ' . $user->email);
        } catch (\Throwable $e) {
            Log::error('2FA email failed: ' . $e->getMessage());
            // On continue malgré l'échec (le code est en base)
        }

        return response()->json([
            'requires_2fa' => true,
            'email'        => $user->email,
        ]);
    }

    public function me(Request $request) { return response()->json($request->user()); }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}