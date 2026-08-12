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

        $retardAuthorization->load('user');
        $employee   = $retardAuthorization->user;
        $statusText = $request->status === 'approved' ? 'validée' : 'refusée';

        try {
            $this->activityService->log(
                $request->user(),
                "autorisation_retard_{$request->status}",
                "Autorisation de retard {$statusText} : " . ($employee?->name ?? 'employé supprimé') . " ({$retardAuthorization->date->format('d/m/Y')})",
                'fas fa-clock'
            );
            if ($employee) {
                $this->notificationService->createForUser(
                    $employee,
                    "Votre autorisation de retard du {$retardAuthorization->date->format('d/m/Y')} a été {$statusText}.",
                    'fas fa-clock',
                    now()->diffForHumans(),
                    '/employee/demandes'
                );
            }
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json($retardAuthorization);
    }
}