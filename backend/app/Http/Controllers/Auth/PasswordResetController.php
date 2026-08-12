<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Aucun compte trouvé avec cet email.'], 404);
        }

        // Générer un code à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'two_factor_code'       => $code,
            'two_factor_expires_at' => now()->addMinutes(10),
        ]);

        // Envoyer le code par email
        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($code));
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(['message' => 'Un code de réinitialisation a été envoyé.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'code'     => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->two_factor_code !== $request->code || now()->greaterThan($user->two_factor_expires_at)) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $user->update([
            'password'               => Hash::make($request->password),
            'two_factor_code'        => null,
            'two_factor_expires_at'  => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}