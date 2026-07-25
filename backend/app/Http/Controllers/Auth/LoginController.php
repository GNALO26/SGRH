<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AbsenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        $token = $user->createToken('auth_token', ['*'], now()->addDay())->plainTextToken;

        // Mise à jour last_login_at
        $user->update(['last_login_at' => now()]);

        // Détection d'absences non justifiées (seulement pour les employés)
        $requiresExplanation = false;
        $pendingAbsences = [];

        if ($user->role === 'employee') {
            $absenceService = app(AbsenceService::class);
            $absenceService->detectAndCreateAbsences($user);

            $pendingAbsences = $user->unjustifiedAbsences()
                ->where('status', 'pending')
                ->get(['id', 'from_date', 'to_date']);

            $requiresExplanation = $pendingAbsences->isNotEmpty();
        }

        return response()->json([
            'user'                 => $user,
            'token'                => $token,
            'requires_explanation' => $requiresExplanation,
            'pending_absences'     => $pendingAbsences,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}