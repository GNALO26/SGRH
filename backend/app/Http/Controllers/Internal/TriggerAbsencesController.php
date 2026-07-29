<?php

namespace App\Http\Controllers\Internal;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AbsenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TriggerAbsencesController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Vérification du token d'accès
        $token = $request->header('X-Absence-Trigger-Token')
              ?? $request->input('token');

        if (!$token || $token !== config('services.absence_trigger_token')) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $processed = 0;
        $employees = User::where('role', 'employee')->get();
        $service   = app(AbsenceService::class);
        $endDate   = Carbon::today(); // on analyse jusqu'à aujourd'hui inclus

        foreach ($employees as $employee) {
            if ($service->detectAndCreateAbsences($employee, $endDate)) {
                $processed++;
            }
        }

        return response()->json([
            'message' => "Détection terminée. {$processed} employé(s) avec de nouvelles absences.",
            'processed' => $processed,
            'total'     => $employees->count(),
        ]);
    }
}