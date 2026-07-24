<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UnjustifiedAbsence;

class UnjustifiedAbsenceController extends Controller
{
    /**
     * Liste paginée de toutes les absences non justifiées, filtrable par statut.
     */
    public function index()
    {
        $absences = UnjustifiedAbsence::with('user')
            ->when(request('status'), fn($q) => $q->where('status', request('status')))
            ->orderByDesc('from_date')
            ->paginate(20);

        return response()->json($absences);
    }

    /**
     * Détail d'une absence.
     */
    public function show(UnjustifiedAbsence $absence)
    {
        $absence->load('user');
        return response()->json($absence);
    }
}