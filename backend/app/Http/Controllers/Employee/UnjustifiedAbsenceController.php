<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\UnjustifiedAbsence;
use App\Services\CloudinaryService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnjustifiedAbsenceController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinaryService,
        private NotificationService $notificationService
    ) {}

    /**
     * Liste les absences non justifiées de l'employé connecté.
     */
    public function index(): JsonResponse
    {
        $absences = request()->user()->unjustifiedAbsences()
            ->when(request('status'), fn($q) => $q->where('status', request('status')))
            ->orderByDesc('from_date')
            ->get();

        return response()->json($absences);
    }

    /**
     * Soumet l'explication et le justificatif pour une absence.
     */
    public function explain(Request $request, UnjustifiedAbsence $absence): JsonResponse
    {
        if ($absence->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        if ($absence->status !== 'pending') {
            return response()->json(['message' => 'Cette absence a déjà été expliquée.'], 422);
        }

        $request->validate([
            'explanation'  => 'required|string|max:2000',
            'justificatif' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $data = [
            'explanation'  => $request->explanation,
            'status'       => 'explained',
            'explained_at' => now(),
        ];

        if ($request->hasFile('justificatif')) {
            $data['justificatif_url'] = $this->cloudinaryService->upload($request->file('justificatif'), 'absences');
        }

        $absence->update($data);

        // Notifier les admins
        try {
            $this->notificationService->createForAdmins(
                "{$request->user()->name} a justifié son absence du {$absence->from_date} au {$absence->to_date}.",
                'fas fa-exclamation-triangle'
            );
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json([
            'message' => 'Votre explication a bien été enregistrée.',
            'absence' => $absence->fresh(),
        ]);
    }
}