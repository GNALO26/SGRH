<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Services\ActivityService;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function __construct(
        private ActivityService $activityService,
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        $leaves = Leave::with('user')->latest()->get()->map(function ($leave) {
            return [
                'id'         => $leave->id,
                'user'       => $leave->user ? ['id' => $leave->user->id, 'name' => $leave->user->name] : null,
                'type'       => $leave->type,
                'start_date' => $leave->start_date,
                'end_date'   => $leave->end_date,
                'reason'     => $leave->reason,
                'status'     => $leave->status,
            ];
        });
        return response()->json($leaves);
    }

    public function update(Request $request, Leave $leave)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        // Mise à jour en base
        $leave->update([
            'status'      => $request->status,
            'approved_by' => $request->user()->id,
        ]);

        // Recharge depuis la base et charge la relation user pour les logs
        $leave->refresh()->load('user');

        $employee   = $leave->user;
        $statusText = $request->status === 'approved' ? 'validé' : 'refusé';

        // Logs et notifications protégés
        try {
            $this->activityService->log(
                $request->user(),
                "congé_{$request->status}",
                "Congé {$statusText} : " . ($employee?->name ?? 'employé supprimé') . " ({$leave->start_date} - {$leave->end_date})",
                'fas fa-calendar-check'
            );
            if ($employee) {
                $this->notificationService->createForUser(
                    $employee,
                    "Votre congé du {$leave->start_date} au {$leave->end_date} a été {$statusText}.",
                    'fas fa-calendar-check',
                    now()->diffForHumans()
                );
            }
        } catch (\Exception $e) {
            report($e);
        }

        // Retourne l'objet complet avec la relation user
        return response()->json([
            'id'         => $leave->id,
            'user'       => $leave->user ? ['id' => $leave->user->id, 'name' => $leave->user->name] : null,
            'type'       => $leave->type,
            'start_date' => $leave->start_date,
            'end_date'   => $leave->end_date,
            'reason'     => $leave->reason,
            'status'     => $leave->status,
        ]);
    }
}