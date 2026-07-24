<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AssistanceController extends Controller
{
    public function index()
    {
        try {
            return response()->json(
                request()->user()->assistanceRequests()->latest()->get()
            );
        } catch (\Exception $e) {
            Log::error('Erreur assistance employee index', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur interne'], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string|max:2000',
        ]);

        try {
            $req = $request->user()->assistanceRequests()->create($validated);

            // Notifier les administrateurs
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                app(NotificationService::class)->createForUser(
                    $admin,
                    "Nouvelle demande d'assistance de {$req->user->name}",
                    'fas fa-life-ring'
                );
            }

            return response()->json($req, 201);
        } catch (\Exception $e) {
            Log::error('Erreur assistance employee store', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de la création de la demande'], 500);
        }
    }
}