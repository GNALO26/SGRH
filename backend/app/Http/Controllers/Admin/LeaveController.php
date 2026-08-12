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

    public function update(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $leave = Leave::findOrFail($id);
        $leave->update([
            'status'      => $request->status,
            'approved_by' => $request->user()->id,
        ]);

        $leave = Leave::with('user')->find($leave->id);
        $employee   = $leave->user;
        $statusText = $request->status === 'approved' ? 'validé' : 'refusé';

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
                    now()->diffForHumans(),
                    '/employee/demandes'   // ← lien employé
                );
            }
        } catch (\Exception $e) {
            report($e);
        }

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