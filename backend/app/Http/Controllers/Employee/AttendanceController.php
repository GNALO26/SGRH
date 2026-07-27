<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use App\Models\Leave;
use App\Services\ActivityService;
use App\Services\AttendanceService;
use App\Services\NotificationService;
use App\Services\PdfService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService   $attendanceService,
        private ActivityService     $activityService,
        private NotificationService $notificationService,
        private PdfService          $pdfService
    ) {}

    /**
     * Enregistre un pointage pour l’employé connecté.
     */
    public function store(AttendanceRequest $request): JsonResponse
    {
        $employee = $request->user();

        $result = $this->attendanceService->attemptCheckIn(
            $employee,
            $request->latitude,
            $request->longitude,
            $request->justification
        );

        if (! $result['success']) {
            return response()->json(
                [
                    'message'                => $result['message'],
                    'requires_justification' => $result['requires_justification'] ?? false,
                ],
                $result['status_code']
            );
        }

        $attendance = $result['attendance'];

        // Log d’activité protégé
        try {
            $this->activityService->log(
                $employee,
                'pointage',
                "{$employee->name} a pointé à {$attendance->check_in_time}",
                'fas fa-fingerprint'
            );
        } catch (\Exception $e) {
            report($e);
        }

        // Notification protégée
        try {
            $this->notificationService->createForUser(
                $employee,
                "Votre pointage de {$attendance->check_in_time} a été enregistré.",
                'fas fa-check-circle',
                now()->diffForHumans()
            );
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json($attendance, $result['status_code']);
    }

    /**
     * Historique paginé des pointages de l’employé connecté.
     */
    public function history()
    {
        $attendances = request()->user()->attendances()
            ->orderBy('date', 'desc')
            ->paginate(30);

        return response()->json($attendances);
    }

    /**
     * Pointage du jour et état de la journée.
     */
    public function today(): JsonResponse
    {
        $employee = request()->user();
        $today    = Carbon::today();
        $now      = Carbon::now();

        // Absence autorisée aujourd’hui ?
        $leaveToday = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();

        // Pointage existant
        $attendance = Attendance::where('user_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        $canCheckIn = true;
        if ($leaveToday || $attendance) {
            $canCheckIn = false;
        }

        // Plages horaires (configurées par l’admin)
        $minTime = Carbon::createFromTime(6, 30);
        $maxTime = Carbon::createFromTime(20, 0);
        if ($now->lt($minTime) || $now->gt($maxTime)) {
            $canCheckIn = false;
        }

        return response()->json([
            'attendance' => $attendance,
            'canCheckIn' => $canCheckIn,
        ]);
    }

    /**
     * Export CSV ou PDF des présences.
     */
    public function export(Request $request)
    {
        $request->validate([
            'format'     => 'required|in:csv,pdf',
            'start_date' => 'required|date',
            'end_date'   => 'required|date',
        ]);

        $employee    = $request->user();
        $attendances = Attendance::where('user_id', $employee->id)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->get();

        if ($request->format === 'csv') {
            $filename = 'presences.csv';
            $headers  = [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($attendances) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['Date', 'Heure', 'Statut', 'Retard (min)', 'Justifié']);
                foreach ($attendances as $a) {
                    fputcsv($file, [
                        $a->date,
                        $a->check_in_time,
                        $a->status,
                        $a->late_minutes ?? 0,
                        $a->is_justified ? 'Oui' : 'Non',
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // format == pdf
        return $this->pdfService->generateAttendanceExport($attendances);
    }
}