<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Services\ActivityService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveController extends Controller
{
    public function __construct(
        private ActivityService $activityService,
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        $leaves = Leave::with('user')->latest()->get();
        return response()->json($leaves);
    }

    public function update(Request $request, $id) // <-- changement ici : on reçoit l'ID brut
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $leave = Leave::findOrFail($id); // <-- chargement manuel du modèle

        Log::info('Tentative validation congé', [
            'leave_id' => $leave->id,
            'current_status' => $leave->status,
            'request_status' => $request->status,
        ]);

        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'Cette demande a déjà été traitée.'], 409);
        }

        try {
            DB::beginTransaction();

            $leave->update([
                'status'      => $request->status,
                'approved_by' => $request->user()->id,
            ]);

            $employee = $leave->user;
            $statusText = $request->status === 'approved' ? 'validé' : 'refusé';

            $start = optional($leave->start_date)->format('d/m/Y') ?? $leave->getRawOriginal('start_date');
            $end   = optional($leave->end_date)->format('d/m/Y') ?? $leave->getRawOriginal('end_date');

            $logMessage = "Congé {$statusText} : " . ($employee?->name ?? 'employé supprimé') . " ({$start} - {$end})";
            $this->activityService->log($request->user(), "congé_{$request->status}", $logMessage, 'fas fa-calendar-check');

            if ($employee) {
                $this->notificationService->createForUser(
                    $employee,
                    "Votre congé du {$start} au {$end} a été {$statusText}.",
                    'fas fa-calendar-check',
                    now()->diffForHumans()
                );
            }

            DB::commit();

            return response()->json($leave->fresh('user'));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur validation congé', [
                'leave_id' => $leave->id,
                'error'    => $e->getMessage(),
                'trace'    => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Erreur serveur. Voir les logs.'], 500);
        }
    }
}