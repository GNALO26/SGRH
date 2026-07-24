<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function index()
    {
        $leaves = request()->user()->leaves()->latest()->get();
        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'type'       => 'required|in:absence,vacation',
            'reason'     => 'required|string|max:1000',
        ]);

        $leave = $request->user()->leaves()->create($validated);

        return response()->json($leave, 201);
    }

    public function destroy(Leave $leave)
    {
        // Vérifie que la demande appartient bien à l'employé connecté
        if ($leave->user_id !== request()->user()->id) {
            abort(403, "Vous n'êtes pas autorisé à annuler cette demande.");
        }

        // ✅ On ne peut annuler qu'une demande encore en attente
        if ($leave->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les demandes en attente peuvent être annulées.',
            ], 409);
        }

        $leave->delete();

        return response()->json(null, 204);
    }
}