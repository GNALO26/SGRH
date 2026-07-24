<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssistanceRequest;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AssistanceController extends Controller
{
    public function index()
    {
        try {
            $requests = AssistanceRequest::with('user')->latest()->paginate(20);
            return response()->json($requests);
        } catch (\Exception $e) {
            Log::error('Erreur assistance index', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur interne. Vérifiez que la table assistance_requests existe.'], 500);
        }
    }

    public function respond(Request $request, AssistanceRequest $assistanceRequest)
    {
        $request->validate([
            'admin_response' => 'nullable|string',
            'status'         => 'required|in:open,in_progress,closed',
        ]);

        $assistanceRequest->update([
            'admin_response' => $request->admin_response,
            'status'         => $request->status,
            'resolved_at'    => $request->status === 'closed' ? now() : null,
        ]);

        if ($assistanceRequest->user) {
            app(NotificationService::class)->createForUser(
                $assistanceRequest->user,
                "Votre demande d'assistance a été mise à jour",
                'fas fa-life-ring'
            );
        }

        return response()->json($assistanceRequest->fresh('user'));
    }
}