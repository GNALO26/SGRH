<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetCode;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class PasswordResetController extends Controller
{
    /**
     * Envoie un code de réinitialisation à 6 chiffres par email.
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Aucun compte trouvé avec cet email.',
        ]);

        $email = $request->email;
        $code = random_int(100000, 999999);

        PasswordReset::updateOrCreate(
            ['email' => $email],
            [
                'code'       => $code,
                'expires_at' => now()->addMinutes(10),
            ]
        );

        try {
            Mail::to($email)->send(new PasswordResetCode($code));
        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'], 500);
        }

        return response()->json(['message' => 'Un code à 6 chiffres a été envoyé à votre adresse email.']);
    }

    /**
     * Vérifie le code et réinitialise le mot de passe.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email|exists:password_resets,email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
        ], [
            'email.exists'          => 'Code invalide ou expiré.',
            'code.size'             => 'Le code doit comporter exactement 6 chiffres.',
            'password.min'          => 'Le mot de passe doit faire au moins 8 caractères.',
            'password.confirmed'    => 'Les mots de passe ne correspondent pas.',
        ]);

        $reset = PasswordReset::where('email', $request->email)
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        $reset->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}