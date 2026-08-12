<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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

        // Stocker le code dans la colonne reset_code (ajoutée via la migration)
        $user->update([
            'reset_code'            => $code,
            'reset_code_expires_at' => now()->addMinutes(10),
        ]);

        // Envoyer le code par email
        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($code));
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Erreur lors de l\'envoi du code.'], 500);
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

        if (!$user ||
            $user->reset_code !== $request->code ||
            now()->greaterThan($user->reset_code_expires_at)
        ) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $user->update([
            'password'              => Hash::make($request->password),
            'reset_code'            => null,
            'reset_code_expires_at' => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}