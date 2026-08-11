<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AbsenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // === 2FA : seulement si tout est en place ===
        $canSend2FA = \Illuminate\Support\Facades\Schema::hasColumn('users', 'two_factor_code')
                      && class_exists(\App\Mail\TwoFactorCodeMail::class)
                      && view()->exists('emails.two_factor_code');

        if ($canSend2FA) {
            try {
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $user->update([
                    'two_factor_code'       => $code,
                    'two_factor_expires_at' => now()->addMinutes(2),
                ]);

                Mail::to($user->email)->send(new \App\Mail\TwoFactorCodeMail($code));

                return response()->json([
                    'requires_2fa' => true,
                    'email'        => $user->email,
                ]);
            } catch (\Throwable $e) {
                report($e);
                // si l'envoi échoue, on continue en mode normal (sans 2FA)
            }
        }

        // === Connexion classique (pas de 2FA) ===
        $token = $user->createToken('auth_token', ['*'], now()->addDay())->plainTextToken;
        $user->update(['last_login_at' => now()]);

        try {
            app(AbsenceService::class)->detectAndCreateAbsences($user);
        } catch (\Throwable $e) {
            report($e);
        }

        $requiresExplanation = false;
        $pendingAbsences     = [];
        if ($user->role === 'employee') {
            $pendingAbsences     = $user->unjustifiedAbsences()->where('status', 'pending')->get(['id','from_date','to_date']);
            $requiresExplanation = $pendingAbsences->isNotEmpty();
        }

        return response()->json([
            'user'                 => $user,
            'token'                => $token,
            'requires_explanation' => $requiresExplanation,
            'pending_absences'     => $pendingAbsences,
        ]);
    }

    public function me(Request $request) { return response()->json($request->user()); }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}