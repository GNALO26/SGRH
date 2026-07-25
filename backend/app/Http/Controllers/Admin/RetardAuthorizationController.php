<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RetardAuthorization;
use App\Services\ActivityService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RetardAuthorizationController extends Controller
{
    public function __construct(
        private ActivityService $activityService,
        private NotificationService $notificationService
    ) {}

    public function index(): JsonResponse
    {
        $authorizations = RetardAuthorization::with('user')->latest()->paginate(20);
        return response()->json($authorizations);
    }

    public function update(Request $request, RetardAuthorization $retardAuthorization): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $retardAuthorization->update([
            'status'      => $request->status,
            'approved_by' => $request->user()->id,
        ]);

        $employee = $retardAuthorization->user;
        $statusText = $request->status === 'approved' ? 'validée' : 'refusée';

        if ($employee) {
            $this->activityService->log(
                $request->user(),
                "autorisation_retard_{$request->status}",
                "Autorisation de retard de {$employee->name} pour le {$retardAuthorization->date->format('d/m/Y')} {$statusText}.",
                'fas fa-clock'
            );

            $this->notificationService->createForUser(
                $employee,
                "Votre autorisation de retard du {$retardAuthorization->date->format('d/m/Y')} a été {$statusText}.",
                'fas fa-clock',
                now()->diffForHumans()
            );
        } else {
            $this->activityService->log(
                $request->user(),
                "autorisation_retard_{$request->status}",
                "Autorisation de retard {$statusText} (utilisateur supprimé).",
                'fas fa-clock'
            );
        }

        // Notification aux admins
        $this->notificationService->createForAdmins(
            "Autorisation retard {$statusText} : {$employee?->name} ({$retardAuthorization->date->format('d/m/Y')})",
            'fas fa-clock'
        );

        return response()->json($retardAuthorization);
    }
}