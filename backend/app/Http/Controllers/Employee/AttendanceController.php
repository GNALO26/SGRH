<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use App\Models\Leave;
use App\Services\AttendanceService;
use App\Services\ActivityService;
use App\Services\NotificationService;
use App\Services\PdfService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService,
        private ActivityService $activityService,
        private NotificationService $notificationService,
        private PdfService $pdfService
    ) {}

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
                ['message' => $result['message'],
                 'requires_justification' => $result['requires_justification'] ?? false],
                $result['status_code']
            );
        }

        $attendance = $result['attendance'];

        $this->activityService->log(
            $employee,
            'pointage',
            "{$employee->name} a pointé à {$attendance->check_in_time}",
            'fas fa-fingerprint'
        );

        $this->notificationService->createForUser(
            $employee,
            "Votre pointage de {$attendance->check_in_time} a été enregistré.",
            'fas fa-check-circle',
            now()->diffForHumans()
        );

        return response()->json($attendance, $result['status_code']);
    }

    public function history()
    {
        $attendances = request()->user()->attendances()
            ->orderBy('date', 'desc')
            ->paginate(30);
        return response()->json($attendances);
    }

    public function today(): JsonResponse
    {
        $employee = request()->user();
        $today = Carbon::today();
        $now = Carbon::now();

        $leave = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();

        $attendance = Attendance::where('user_id', $employee->id)
            ->whereDate('date', $today)->first();

        $canCheckIn = true;
        if ($leave || $attendance) {
            $canCheckIn = false;
        }
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
     * Export des présences en PDF uniquement, avec le nom de l'employé.
     */
    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date',
        ]);

        $employee = $request->user();
        $attendances = Attendance::where('user_id', $employee->id)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->get();

        return $this->pdfService->generateAttendanceExport($attendances, $employee->name);
    }
}