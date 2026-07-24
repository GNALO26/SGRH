<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\UnjustifiedAbsence;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class UnjustifiedAbsenceController extends Controller
{
    public function __construct(private CloudinaryService $cloudinaryService) {}

    /**
     * Liste les absences non justifiées de l'employé connecté.
     */
    public function index()
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
    public function explain(Request $request, UnjustifiedAbsence $absence)
    {
        // Vérifier que l'absence appartient bien à l'employé connecté
        if ($absence->user_id !== $request->user()->id) {
            abort(403, 'Accès interdit');
        }

        // Vérifier qu'elle est encore en attente
        if ($absence->status !== 'pending') {
            return response()->json(['message' => 'Cette absence a déjà été expliquée.'], 422);
        }

        $request->validate([
            'explanation' => 'required|string|max:2000',
            'justificatif' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $data = [
            'explanation'  => $request->explanation,
            'status'       => 'explained',
            'explained_at' => now(),
        ];

        // Upload du justificatif si présent
        if ($request->hasFile('justificatif')) {
            $data['justificatif_url'] = $this->cloudinaryService->upload(
                $request->file('justificatif'),
                'absences'
            );
        }

        $absence->update($data);

        return response()->json([
            'message'  => 'Votre explication a bien été enregistrée.',
            'absence'  => $absence->fresh(),
        ]);
    }
}